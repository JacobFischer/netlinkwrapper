import { TextEncoder } from "util";
import { expect } from "chai";
import { udpTester, getNextTestingPort } from "./utils";

describe("UDP specific tests", function () {
    udpTester.testPermutations((testing) => {
        it("can receiveFrom other UDP sockets", async function () {
            const sentPromise = testing.echo.events.sentData.once();
            testing.netLink.sendTo(
                testing.host,
                testing.echo.getPort(),
                testing.str,
            );
            void (await sentPromise);
            const read = testing.netLink.receiveFrom();

            expect(read).to.exist;
            const isIPv4 = testing.ipVersion === "IPv4";
            expect(read?.host).to.equal(isIPv4 ? "127.0.0.1" : "::1");
            expect(read?.port).to.equal(testing.echo.getPort());
            expect(read?.data.toString()).to.equal(testing.str);
        });

        it("can receiveFrom nothing", function () {
            testing.netLink.isBlocking = false;
            const readFromNothing = testing.netLink.receiveFrom();
            expect(readFromNothing).to.be.undefined;
        });

        it("can sendTo other UDP sockets", async function () {
            const sentPromise = testing.echo.events.sentData.once();
            testing.netLink.sendTo(
                testing.host,
                testing.echo.getPort(),
                testing.str,
            );
            const sent = await sentPromise;

            expect(sent.from.port).to.equal(testing.netLink.portFrom);
            expect(sent.str).to.equal(testing.str);
        });

        it("can sendTo with Buffers", async function () {
            const sentPromise = testing.echo.events.sentData.once();
            const buffer = Buffer.from(testing.str);
            testing.netLink.sendTo(
                testing.host,
                testing.echo.getPort(),
                buffer,
            );
            const sent = await sentPromise;

            expect(sent.buffer.compare(buffer)).to.equal(0);
        });

        it("can sendTo with Uint8Arrays", async function () {
            const sentPromise = testing.echo.events.sentData.once();
            const array = new TextEncoder().encode(testing.str);
            testing.netLink.sendTo(
                testing.host,
                testing.echo.getPort(),
                array,
            );
            const sent = await sentPromise;

            expect(sent.str).to.equal(testing.str);
        });

        it("can sendTo nothing", function () {
            expect(() =>
                testing.netLink.sendTo(
                    "localhost",
                    getNextTestingPort(), // no one should be listening here
                    "I scream into the void",
                ),
            ).not.to.throw();
        });
    });
});
