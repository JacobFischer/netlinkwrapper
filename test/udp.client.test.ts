import { NetLinkSocketClientUDP } from "../lib";
import { setupTestingForClientUDP } from "./utils";
import { expect } from "chai";

describe("UDP client specific functionality", function () {
    const testing = setupTestingForClientUDP(this);

    it("can be constructed with portTo set", async function () {
        const sibling = testing.netLink;
        const portFrom = sibling.getPortFrom() + 100;
        expect(portFrom).not.to.equal(sibling.getPortFrom());
        expect(portFrom).not.to.equal(sibling.getPortTo());

        const udp = new NetLinkSocketClientUDP(
            testing.host,
            testing.port,
            portFrom,
        );

        const testingString = `My port should be from: ${portFrom}`;
        const onceSent = testing.server.events.sentData.once();
        udp.write(testingString);
        const sent = await onceSent;

        expect(sent.from.port).to.equal(portFrom);
        expect(sent.data.toString()).to.equal(testingString);
    });

    it("can readFrom other UDP sockets", async function () {
        const sentPromise = testing.server.events.sentData.once();
        const testingString = "You should ask Oma.";
        testing.netLink.write(testingString);
        void (await sentPromise);
        const read = testing.netLink.readFrom();

        expect(read.host).to.equal("127.0.0.1");
        expect(read.port).to.equal(testing.port);
        expect(read.data.toString()).to.equal(testingString);
    });

    it("can readFrom nothing", function () {
        testing.netLink.setBlocking(false);
        const readFromNothing = testing.netLink.readFrom();
        expect(readFromNothing).to.be.undefined;
    });

    it("can writeTo other UDP sockets", async function () {
        const sentPromise = testing.server.events.sentData.once();
        const testingString = "Indeed";
        testing.netLink.writeTo(testing.host, testing.port, testingString);
        const sent = await sentPromise;

        expect(sent.from.port).to.equal(testing.netLink.getPortFrom());
        expect(sent.data).to.equal(testingString);
    });

    it("can writeTo nothing", function () {
        expect(() =>
            testing.netLink.writeTo(
                "192.0.2.0", // invalid via RFC 5737
                1234,
                "I scream into the void",
            ),
        ).not.to.throw;
    });
});