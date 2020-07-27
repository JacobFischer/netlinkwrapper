import { expect } from "chai";
import { Socket } from "net";
import { NetLinkSocketClientTCP } from "../lib";
import { setupTestingForClientTCP } from "./utils";

describe("TCP client specific functionality", function () {
    const testing = setupTestingForClientTCP(this);

    it("can register as a TCP listener", async function () {
        const connectionPromise = testing.echo.events.newConnection.once();
        const preConnectionCount = await testing.echo.countConnections();
        expect(preConnectionCount).to.equal(1);

        const tcp = new NetLinkSocketClientTCP(testing.host, testing.port);
        const listener = await connectionPromise;
        expect(listener).to.be.instanceOf(Socket);

        const postConnectionCount = await testing.echo.countConnections();
        expect(postConnectionCount).to.equal(2); // TODO: disconnect testing.netLink before this

        const disconnectPromise = testing.echo.events.closedConnection.once();
        tcp.disconnect();
        const disconnected = await disconnectPromise;
        expect(disconnected.from).to.equal(listener);
        expect(disconnected.hadError).to.be.false;
    });
});
