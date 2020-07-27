import { NetLinkSocketUDP } from "../lib";
import { setupTestingForUDP } from "./utils";
import { expect } from "chai";

describe("UDP client specific functionality", function () {
    const testing = setupTestingForUDP(this);

    it("can be constructed with portTo set", async function () {
        const sibling = testing.netLink;
        const portFrom = sibling.getPortFrom() + 100;
        expect(portFrom).not.to.equal(sibling.getPortFrom());
        expect(portFrom).not.to.equal(sibling.getPortTo());

        const udp = new NetLinkSocketUDP(testing.host, testing.port, portFrom);

        const testingString = `My port should be from: ${portFrom}`;
        const onceSent = testing.echo.events.sentData.once();
        udp.send(testingString);
        const sent = await onceSent;

        expect(sent.from.port).to.equal(portFrom);
        expect(sent.data.toString()).to.equal(testingString);
    });

    it("can readFrom other UDP sockets", async function () {
        const sentPromise = testing.echo.events.sentData.once();
        const testingString = "You should ask Oma.";
        testing.netLink.send(testingString);
        void (await sentPromise);
        const read = testing.netLink.receiveFrom();

        expect(read).to.exist;
        if (read) {
            expect(read.host).to.equal("127.0.0.1");
            expect(read.port).to.equal(testing.port);
            expect(read.data.toString()).to.equal(testingString);
        } else {
            expect.fail("read should have existed");
        }
    });

    it("can readFrom nothing", function () {
        testing.netLink.setBlocking(false);
        const readFromNothing = testing.netLink.receiveFrom();
        expect(readFromNothing).to.be.undefined;
    });

    it("can writeTo other UDP sockets", async function () {
        const sentPromise = testing.echo.events.sentData.once();
        const testingString = "Indeed";
        testing.netLink.sendTo(testing.host, testing.port, testingString);
        const sent = await sentPromise;

        expect(sent.from.port).to.equal(testing.netLink.getPortFrom());
        expect(sent.data).to.equal(testingString);
    });

    it("can writeTo nothing", function () {
        expect(() =>
            testing.netLink.sendTo(
                "192.0.2.0", // invalid via RFC 5737
                1234,
                "I scream into the void",
            ),
        ).not.to.throw;
    });
});
