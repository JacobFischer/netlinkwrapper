import { Socket } from "net";
import { NetLinkSocketBase, NetLinkSocketClientTCP } from "../lib";
import { EchoServer, port } from "./echo-server";
import { expect } from "chai";
import { fork } from "child_process";
import { join, resolve } from "path";

// const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
const localhost = "127.0.0.1";

describe("base Sockets", function () {
    const server = new EchoServer();
    before(async function () {
        return await server.listen();
    });
    after(async function () {
        await server.close();
        // HACK: here's the deal, mocha will tear down test workers before v8
        // cleans up the sockets we are testing with
        // If this happens on Mac/Linux system you will see segfaults **just** in
        // tests. If it happens in Windows you can see that, and the port will
        // remain blocked untill you kill processes or reboot your computer.
        // Not condusive to testing.
        // A 1 second delay solves all this magically :P
        // await delay(1000);
    });

    it("can connect and disconnect", async function () {
        const connectionPromise = server.events.newConnection.once();
        const preConnectionCount = await server.countConnections();
        expect(preConnectionCount).to.equal(0);

        const netLink = new NetLinkSocketClientTCP(localhost, port);
        const listener = await connectionPromise;
        expect(listener).to.be.instanceOf(Socket);

        // should now be the only connection
        const postConnectionCount = await server.countConnections();
        expect(postConnectionCount).to.equal(1);

        const disconnectPromise = server.events.closedConnection.once();
        netLink.disconnect();
        const disconnected = await disconnectPromise;
        expect(disconnected.socket).to.equal(listener);
        expect(disconnected.hadError).to.be.false;
    });

    it("can read and write strings", async function () {
        const dataPromise = server.events.sentData.once();
        const listenerPromise = server.events.newConnection.once();

        const netLink = new NetLinkSocketClientTCP(localhost, port);
        const listener = await listenerPromise;

        const sending = "Make it so number one.";
        netLink.write(sending);
        const sent = await dataPromise;
        const sentString = sent.data.toString();
        expect(sentString).to.equal(sending); // should be echoed back
        expect(sent.socket).to.equal(listener);

        const read = netLink.read(1024);
        expect(read).to.be.instanceOf(Buffer);
        expect(read && read.toString()).to.equal(sentString);
        netLink.disconnect();
        await server.events.closedConnection.once();
    });

    it("inherits from the base", function () {
        const netLink = new NetLinkSocketClientTCP(localhost, port);
        expect(netLink).instanceOf(NetLinkSocketBase);
        netLink.disconnect();
    });

    it("can get blocking state", function () {
        const netLink = new NetLinkSocketClientTCP(localhost, port);
        netLink.setBlocking(true);
        expect(netLink.isBlocking()).to.be.true;
        netLink.setBlocking(false);
        expect(netLink.isBlocking()).to.be.false;
        netLink.disconnect();
    });

    it("can do non blocking reads", async function () {
        const netLink = new NetLinkSocketClientTCP(localhost, port);
        netLink.setBlocking(false);

        const read = netLink.read(1024);
        expect(read).to.be.undefined;
        netLink.disconnect();
        await server.events.closedConnection.once();
    });

    it("can do blocking reads", async function () {
        this.timeout(10_000); // slow because child process need ts-node transpiling on the fly

        const testString = "Hello worker thread!";
        const newConnectionPromise = server.events.newConnection.once();
        const sentDataPromise = server.events.sentData.once();
        // unlike other tests, the netlink tests are all in the worker code
        const workerPath = resolve(
            join(__dirname, "./blocking-test-worker.ts"),
        );
        const worker = fork(workerPath, [], {
            env: { testString },
            execArgv: ["-r", "ts-node/register"],
        });

        await newConnectionPromise;
        const sent = await sentDataPromise;

        expect(sent.data).to.exist;
        expect(sent.data && sent.data.toString()).to.equal(testString);

        await server.events.closedConnection.once();

        const code = await new Promise((resolve, reject) =>
            worker.on("exit", (code) => {
                if (code) {
                    reject(
                        new Error(`Worker process exited with code ${code}`),
                    );
                } else {
                    resolve(code);
                }
            }),
        );
        expect(code).to.equal(0);
    });
});
