import { Socket } from "net";
import { netLinkWrapper } from "../src";
import { EchoServer } from "./echo-server";
import { expect } from "chai";

// const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

describe("netLinkWrapper", function () {
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

    it("constructs", function () {
        const netLink = new netLinkWrapper();
        expect(netLink).to.be.instanceOf(netLinkWrapper);
    });

    it("can connect and disconnect", async function () {
        const connectionPromise = server.events.newConnection.once();
        const netLink = new netLinkWrapper();

        // should not be connected yet
        const preConnectionCount = await server.countConnections();
        expect(preConnectionCount).to.equal(0);

        netLink.connect(server.port);
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

        const netLink = new netLinkWrapper();
        netLink.connect(server.port);
        const listener = await listenerPromise;

        const sending = "Make it so number one.";
        const expectedEcho = server.echoFormatter(sending);
        netLink.write(sending);
        const sent = await dataPromise;
        const sentString = sent.data.toString();
        expect(sentString).to.equal(expectedEcho);
        expect(sent.socket).to.equal(listener);

        const read = netLink.read(1024);
        expect(read).to.be.instanceOf(Buffer);
        expect(read && read.toString()).to.equal(sentString);
        netLink.disconnect();
        await server.events.closedConnection.once();
    });

    it("can do non blocking reads", async function () {
        const netLink = new netLinkWrapper();
        netLink.connect(server.port);
        netLink.blocking(false);

        const read = netLink.read(1024);
        expect(read).to.be.undefined;
        netLink.disconnect();
        await server.events.closedConnection.once();
    });

    /*
    // TODO: spin up server on real seperate thread so this one can be properly blocked
    it("can do blocking reads", async () => {
        const netLink = new netLinkWrapper();
        netLink.connect(server.port);
        netLink.blocking(true);

        const broadcasted = "Jaffa kree!";
        setTimeout(() => void server.broadcast(broadcasted), 250);

        console.log("hey kids guess what, blocking!");
        const read = netLink.read(broadcasted.length - 2); // should block here
        console.log("we back", read);
        expect(read).to.equal(broadcasted);
        netLink.disconnect();
        await server.events.closedConnection.once();
    });
    */
});
