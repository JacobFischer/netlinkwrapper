import { NetLinkSocketBase } from "../lib";
import { badArg, EchoSocket, setups } from "./utils";
import { expect } from "chai";

const setupsList = [setups.tcpClient, setups.tcpServer, setups.udp];

describe("base sockets", function () {
    it("cannot be constructed as a base class.", function () {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            new (NetLinkSocketBase as any)();
        }).to.throw();
    });

    for (const { setup, isClient, isTCP } of setupsList) {
        const protocol = isTCP ? "TCP" : "UDP";
        const socketType = isClient ? "Client" : "Server";
        const description = `${protocol} ${socketType} base functionality`;

        describe(description, function () {
            const testing = setup(this);

            it("exists", function () {
                expect(testing.netLink).to.exist;
            });

            it("sets up testing data", function () {
                expect(testing).to.exist;
                expect(testing.echo).to.be.instanceOf(EchoSocket);
                expect(testing.netLink).to.be.instanceOf(NetLinkSocketBase);
                expect(typeof testing.host).to.equal("string");
                expect(typeof testing.port).to.equal("number");
                expect(typeof testing.str).to.equal("string");
            });

            it("extends NetLinkSocketBase", function () {
                expect(testing.netLink).to.be.instanceof(NetLinkSocketBase);
            });

            it("can get and set blocking state", function () {
                testing.netLink.setBlocking(true);
                expect(testing.netLink.isBlocking()).to.be.true;
                testing.netLink.setBlocking(false);
                expect(testing.netLink.isBlocking()).to.be.false;
            });

            it("will not accept invalid setBlocking args", function () {
                expect(() => testing.netLink.setBlocking(badArg())).to.throw();
            });

            it("can get portFrom", function () {
                const portFrom = testing.netLink.getPortFrom();
                expect(typeof portFrom).to.equal("number");
                // can't guarantee portFrom is bound to a specific number for
            });

            it("can check isTCP", function () {
                const checked = testing.netLink.isTCP();
                expect(typeof checked).to.equal("boolean");
                expect(checked).to.equal(isTCP);
            });

            it("can check isUDP", function () {
                const checked = testing.netLink.isUDP();
                expect(typeof checked).to.equal("boolean");
                expect(checked).to.equal(!isTCP);
            });

            it("can disconnect", function () {
                testing.netLink.disconnect();
            });

            it("can check isDestroyed", function () {
                expect(testing.netLink.isDestroyed()).to.be.false;
                testing.netLink.disconnect();
                expect(testing.netLink.isDestroyed()).to.be.true;
            });
        });
    }
});
