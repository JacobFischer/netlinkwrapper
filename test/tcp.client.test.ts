import { expect } from "chai";
import { Socket } from "net";
import { NetLinkSocketClientTCP } from "../lib";
import { badArg, TesterClientTCP } from "./utils";

describe("TCP client specific functionality", function () {
    const testing = new TesterClientTCP(this);

    it("can register as a TCP listener", async function () {
        // disconnect the tester
        testing.netLink.disconnect();
        await testing.echo.events.closedConnection.once();

        const connectionPromise = testing.echo.events.newConnection.once();
        const preConnectionCount = await testing.echo.countConnections();
        expect(preConnectionCount).to.equal(0);

        const tcp = new NetLinkSocketClientTCP(testing.port, testing.host);
        const listener = await connectionPromise;
        expect(listener).to.be.instanceOf(Socket);

        const postConnectionCount = await testing.echo.countConnections();
        expect(postConnectionCount).to.equal(1);

        const disconnectPromise = testing.echo.events.closedConnection.once();
        tcp.disconnect();
        const disconnected = await disconnectPromise;
        expect(disconnected.from).to.equal(listener);
        expect(disconnected.hadError).to.be.false;
    });

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
