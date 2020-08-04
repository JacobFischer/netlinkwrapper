import { NetLinkSocketBase } from "../lib";
import {
    badArg,
    EchoSocket,
    TesterClientTCP,
    TesterServerTCP,
    TesterUDP,
} from "./utils";
import { expect } from "chai";

const testers = [TesterClientTCP, TesterServerTCP, TesterUDP];

describe("base sockets", function () {
    it("cannot be constructed as a base class.", function () {
        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            new (NetLinkSocketBase as any)();
        }).to.throw();
    });

    for (const Tester of testers) {
        describe(`${Tester.tests} base functionality`, function () {
            const testing = new Tester(this);

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
                expect(testing.netLink.isBlocking).to.be.true;
                testing.netLink.isBlocking = false;
                expect(testing.netLink.isBlocking).to.be.false;
                testing.netLink.isBlocking = true;
                expect(testing.netLink.isBlocking).to.be.true;
            });

            it("cannot set isBlocking to an invalid arg", function () {
                expect(() => {
                    testing.netLink.isBlocking = badArg();
                }).to.throw();
            });

            it("can get portFrom", function () {
                const portFrom = testing.netLink.portFrom;
                expect(typeof portFrom).to.equal("number");
                // can't guarantee portFrom is bound to a specific number for
            });

            it("cannot set portFrom", function () {
                expect(() => {
                    testing.settableNetLink.portFrom = badArg();
                }).to.throw();
            });

            it("can disconnect", function () {
                testing.netLink.disconnect();
            });

            it("can get isDestroyed", function () {
                expect(testing.netLink.isDestroyed).to.be.false;
                testing.netLink.disconnect();
                expect(testing.netLink.isDestroyed).to.be.true;
            });

            it("cannot set isDestroyed", function () {
                expect(() => {
                    testing.settableNetLink.isDestroyed = badArg();
                }).to.throw();
            });

            it("can get isIPv4", function () {
                expect(typeof testing.netLink.isIPv4).to.equal("boolean");
            });

            it("cannot set isIPv4", function () {
                expect(() => {
                    testing.settableNetLink.isIPv4 = badArg();
                }).to.throw();
            });

            it("can get isIPv6", function () {
                expect(typeof testing.netLink.isIPv6).to.equal("boolean");
            });

            it("cannot set isIPv6", function () {
                expect(() => {
                    testing.settableNetLink.isIPv6 = badArg();
                }).to.throw();
            });
        });
    }
});
