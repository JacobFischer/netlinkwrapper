import { expect } from "chai";
import { Socket } from "net";
import { SocketClientTCP } from "../lib";
import {
    badArg,
    BadConstructor,
    badIPAddress,
    EchoClientTCP,
    getNextTestingPort,
    tcpClientTester,
} from "./utils";

describe("TCP Client", function () {
    it("should throw without a port passed", function () {
        expect(() => {
            new (SocketClientTCP as BadConstructor)();
        }).to.throw(TypeError);
    });

    it("should throw without a host passed", function () {
        expect(() => {
            new (SocketClientTCP as BadConstructor)(12345);
        }).to.throw(TypeError);
    });

    tcpClientTester.permutations("standalone", ({ ipVersion }) => {
        it("can register as a TCP listener", async function () {
            const echoServer = new EchoClientTCP();
            const port = getNextTestingPort();
            await echoServer.start({ port });

            const connected = echoServer.events.newConnection.once();
            const preConnectionCount = await echoServer.countConnections();
            expect(preConnectionCount).to.equal(0);

            const tcp = new SocketClientTCP(port, "localhost", ipVersion);
            const listener = await connected;
            expect(listener).to.be.instanceOf(Socket);

            const postConnectionCount = await echoServer.countConnections();
            expect(postConnectionCount).to.equal(1);

            const disconnected = echoServer.events.closedConnection.once();
            tcp.disconnect();
            const data = await disconnected;
            expect(data.from).to.equal(listener);
            expect(data.hadError).to.be.false;

            await echoServer.stop();
        });

        it("throws when it cannot connect to a server", function () {
            // extremely long timeout so all operating systems can run this
            this.timeout(2 * 60 * 1_000); // 2 min

            expect(
                () => new SocketClientTCP(1234, badIPAddress, ipVersion),
            ).to.throw();
        });
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
