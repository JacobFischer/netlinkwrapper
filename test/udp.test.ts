import { TextEncoder } from "util";
import { expect } from "chai";
import { NetLinkSocketUDP } from "../lib";
import { setupTestingForUDP } from "./utils";

describe("UDP client specific functionality", function () {
    const testing = setupTestingForUDP(this);

    it("can be constructed with portFrom set", async function () {
        const sibling = testing.netLink;
        const portFrom = sibling.getPortFrom() + 100;
        expect(portFrom).not.to.equal(sibling.getPortFrom());
        expect(portFrom).not.to.equal(sibling.getPortTo());

        const udp = new NetLinkSocketUDP(testing.host, testing.port, portFrom);
        expect(udp.getPortFrom()).to.equal(portFrom);

        const onceSent = testing.echo.events.sentData.once();
        udp.send(testing.str);
        const sent = await onceSent;

        expect(sent.from.port).to.equal(portFrom);
        expect(sent.str).to.equal(testing.str);
    });

    it("can receiveFrom other UDP sockets", async function () {
        const sentPromise = testing.echo.events.sentData.once();
        testing.netLink.send(testing.str);
        void (await sentPromise);
        const read = testing.netLink.receiveFrom();

        expect(read).to.exist;
        if (read) {
            expect(read.host).to.equal("127.0.0.1");
            expect(read.port).to.equal(testing.port);
            expect(read.data.toString()).to.equal(testing.str);
        } else {
            expect.fail("read should have existed");
        }
    });

    it("can receiveFrom nothing", function () {
        testing.netLink.setBlocking(false);
        const readFromNothing = testing.netLink.receiveFrom();
        expect(readFromNothing).to.be.undefined;
    });

    it("can sendTo other UDP sockets", async function () {
        const sentPromise = testing.echo.events.sentData.once();
        testing.netLink.sendTo(testing.host, testing.port, testing.str);
        const sent = await sentPromise;

        expect(sent.from.port).to.equal(testing.netLink.getPortFrom());
        expect(sent.str).to.equal(testing.str);
    });

    it("can sendTo with Buffers", async function () {
        const sentPromise = testing.echo.events.sentData.once();
        const buffer = Buffer.from(testing.str);
        testing.netLink.sendTo(testing.host, testing.port, buffer);
        const sent = await sentPromise;

        expect(sent.buffer.compare(buffer)).to.equal(0);
    });

    it("can sendTo with Uint8Arrays", async function () {
        const sentPromise = testing.echo.events.sentData.once();
        const array = new TextEncoder().encode(testing.str);
        testing.netLink.sendTo(testing.host, testing.port, array);
        const sent = await sentPromise;

        expect(sent.str).to.equal(testing.str);
    });

    it("can sendTo nothing", function () {
        expect(() =>
            testing.netLink.sendTo(
                "192.0.2.0", // invalid via RFC 5737
                1234,
                "I scream into the void",
            ),
        ).not.to.throw;
    });
});
