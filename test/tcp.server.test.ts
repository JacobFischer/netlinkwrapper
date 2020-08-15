import { expect } from "chai";
import { badArg, BadConstructor, tcpServerTester } from "./utils";
import { SocketClientTCP, SocketServerTCP } from "../lib";

describe("TCP Server", function () {
    it("should throw without a port passed", function () {
        expect(() => {
            new (SocketServerTCP as BadConstructor)();
        }).to.throw(TypeError);
    });

    tcpServerTester.testPermutations((testing) => {
        it("exists", function () {
            expect(testing.netLink).to.exist;
        });

        it(`is IP Version "${testing.ipVersion}"`, function () {
            expect(testing.netLink.isIPv4).to.equal(
                testing.ipVersion !== "IPv6",
            );
            expect(testing.netLink.isIPv6).to.equal(
                testing.ipVersion === "IPv6",
            );
        });

        it("can get hostFrom", function () {
            expect(testing.netLink.hostFrom).to.equal(
                testing.constructorArgs.host ? testing.host : "",
            );
        });

        it("cannot set hostFrom", function () {
            expect(() => {
                testing.settableNetLink.hostFrom = badArg();
            }).to.throw();
        });

        it("can accept clients", function () {
            const client = testing.netLink.accept();

            expect(client).to.exist;
            expect(client).to.be.an.instanceOf(SocketClientTCP);

            expect(client?.portFrom).to.equal(testing.port);

            client?.disconnect();
        });

        it("can accept with not blocking", function () {
            testing.netLink.isBlocking = false;
            const firstClient = testing.netLink.accept();

            expect(firstClient).to.be.an.instanceOf(SocketClientTCP);
            expect(firstClient?.portFrom).to.equal(testing.port);
            firstClient?.disconnect();

            const secondClient = testing.netLink.accept();
            expect(secondClient).to.be.undefined;
        });

        it("cannot accept clients once disconnected", function () {
            testing.netLink.disconnect();

            expect(() => testing.netLink.accept()).to.throw();
        });

        it("can send and receive data to the client", async function () {
            const client = testing.netLink.accept();

            expect(client).to.exist;
            if (!client) {
                throw new Error("client should exist");
            }

            const sentData = testing.echo.events.sentData.once();
            client.isBlocking = false;
            expect(client.receive()).to.be.undefined;
            client.send(testing.str);
            const sent = await sentData;
            expect(sent.str).to.equal(testing.str);
            const echoed = client.receive();
            expect(echoed?.toString()).to.equal(testing.str);

            client.disconnect();
        });

        it("can attempt to accept when no clients connect", function () {
            // We don't want it to block forever waiting for a client that
            // will never exist
            testing.netLink.isBlocking = false;

            // first echo client that always connects
            const client = testing.netLink.accept();
            expect(client).to.exist;

            // we never made anything else connect, so expect nothing to accept
            const noClient = testing.netLink.accept();
            expect(noClient).to.be.undefined;

            client?.disconnect();
        });
    });
});
