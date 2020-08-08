import { expect } from "chai";
import { Socket } from "net";
import { NetLinkSocketClientTCP } from "../lib";
import {
    badArg,
    badIPAddress,
    EchoClientTCP,
    getNextTestingPort,
    tcpClientTester,
} from "./utils";

describe("TCP Client", function () {
    it("throws when it cannot connect to a server", function () {
        this.timeout(30_000);

        expect(
            () => new NetLinkSocketClientTCP(1234, badIPAddress),
        ).to.throw();
    });

    it("can register as a TCP listener", async function () {
        const echoServer = new EchoClientTCP();
        const port = getNextTestingPort();
        await echoServer.start({ port });

        const connectionPromise = echoServer.events.newConnection.once();
        const preConnectionCount = await echoServer.countConnections();
        expect(preConnectionCount).to.equal(0);

        const tcp = new NetLinkSocketClientTCP(port, "localhost");
        const listener = await connectionPromise;
        expect(listener).to.be.instanceOf(Socket);

        const postConnectionCount = await echoServer.countConnections();
        expect(postConnectionCount).to.equal(1);

        const disconnectPromise = echoServer.events.closedConnection.once();
        tcp.disconnect();
        const disconnected = await disconnectPromise;
        expect(disconnected.from).to.equal(listener);
        expect(disconnected.hadError).to.be.false;

        await echoServer.stop();
    });

    tcpClientTester.testPermutations((testing) => {
        it("can get hostTo", function () {
            const { hostTo } = testing.netLink;

            expect(typeof hostTo).to.equal("string");
            expect(hostTo).to.equal(testing.host);
        });

        it("cannot set hostTo", function () {
            expect(() => {
                testing.settableNetLink.hostTo = badArg();
            }).to.throw();
        });

        it("can get portTo", function () {
            const { portTo } = testing.netLink;

            expect(typeof portTo).to.equal("number");
            expect(portTo).to.equal(testing.port);
        });

        it("cannot set portTo", function () {
            expect(() => {
                testing.settableNetLink.portTo = badArg();
            }).to.throw();
        });
    });
});
