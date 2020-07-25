import { NetLinkSocketBase } from "../lib";
import { testingClients } from "./utils";
import { expect } from "chai";

const host = "127.0.0.1";
const startingPort = 48001;

describe("base sockets", function () {
    it("cannot be constructed as a base class.", function () {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            new (NetLinkSocketBase as any)();
        }).to.throw();
    });

    for (let i = 0; i < testingClients.length; i++) {
        const { setup, isClient, isTCP } = testingClients[i];
        const port = startingPort + i;
        const testing = setup(host, port);
        const protocal = isTCP ? "TCP" : "UDP";
        const socketType = isClient ? "Client" : "Server";
        const description = `${protocal} ${socketType} base functionality`;

        describe(description, function () {
            beforeEach(testing.beforeEachTest);
            afterEach(testing.afterEachTest);

            it("exists", function () {
                expect(testing.netLink).to.exist;
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

            it("can get hostFrom", function () {
                const hostFrom = testing.netLink.getHostFrom();
                expect(typeof hostFrom).to.equal("string");
            });

            it("can get hostTo", function () {
                expect(testing.netLink.getHostTo()).to.equal(host);
            });

            it("can get portFrom", function () {
                expect(typeof testing.netLink.getPortFrom()).to.equal(
                    "number",
                );
            });

            it("can get portTo", function () {
                expect(testing.netLink.getPortTo()).to.equal(port);
            });

            it("can get socketHandler", function () {
                expect(typeof testing.netLink.getSocketHandler()).to.equal(
                    "number",
                );
            });

            it("can check isClient", function () {
                const checked = testing.netLink.isClient();
                expect(typeof checked).to.equal("boolean");
                expect(checked).to.equal(isClient);
            });

            it("can check isServer", function () {
                const checked = testing.netLink.isServer();
                expect(typeof checked).to.equal("boolean");
                expect(checked).to.equal(!isClient);
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
        });
    }
});
