import { NetLinkSocketBase, NetLinkSocketClientTCP } from "../lib";
import { EchoServer } from "./echo-server";
import { expect } from "chai";

const localhost = "127.0.0.1";
const port = 48001;

describe("Base Sockets", function () {
    const server = new EchoServer();
    let netLink: NetLinkSocketBase = (null as unknown) as NetLinkSocketBase;
    before(async function () {
        const connectionPromise = server.events.newConnection.once();
        await server.listen(port);
        netLink = new NetLinkSocketClientTCP(localhost, port);
        await connectionPromise;
    });
    after(async function () {
        const disconnectPromise = server.events.closedConnection.once();
        netLink.disconnect();
        await disconnectPromise;
        await server.close();
    });

    it("cannot be constructed as a base class.", function () {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const BaseClass = (NetLinkSocketBase as unknown) as Function & {
            new (): void;
        };
        expect(() => new BaseClass()).to.throw();
    });

    it("can get and set blocking state", function () {
        netLink.setBlocking(true);
        expect(netLink.isBlocking()).to.be.true;
        netLink.setBlocking(false);
        expect(netLink.isBlocking()).to.be.false;
    });

    it("can get hostFrom", function () {
        const hostFrom = netLink.getHostFrom();
        expect(typeof hostFrom).to.equal("string");
    });

    it("can get hostTo", function () {
        expect(netLink.getHostTo()).to.equal(localhost);
    });

    it("can get portFrom", function () {
        expect(typeof netLink.getPortFrom()).to.equal("number");
    });

    it("can get portTo", function () {
        expect(netLink.getPortTo()).to.equal(port);
    });

    it("can get socketHandler", function () {
        expect(typeof netLink.getSocketHandler()).to.equal("number");
    });

    it("can check isClient", function () {
        expect(typeof netLink.isClient()).to.equal("boolean");
    });

    it("can check isServer", function () {
        expect(typeof netLink.isServer()).to.equal("boolean");
    });

    it("can check isTCP", function () {
        expect(typeof netLink.isTCP()).to.equal("boolean");
    });

    it("can check isUDP", function () {
        expect(typeof netLink.isUDP()).to.equal("boolean");
    });
});
