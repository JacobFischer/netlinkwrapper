import { Socket } from "net";
import { NetLinkSocketBase, NetLinkSocketClientTCP } from "../lib";
import { EchoServer } from "./echo-server";
import { expect } from "chai";

const localhost = "127.0.0.1";
const port = 48001;

describe("Base Sockets", function () {
    const server = new EchoServer();
    before(async function () {
        return await server.listen(port);
    });
    after(async function () {
        await server.close();
    });

    it("can connect and disconnect", async function () {
        const connectionPromise = server.events.newConnection.once();
        const preConnectionCount = await server.countConnections();
        expect(preConnectionCount).to.equal(0);

        const netLink = new NetLinkSocketClientTCP(localhost, port);
        const listener = await connectionPromise;
        expect(listener).to.be.instanceOf(Socket);

        // should now be the only connection
        const postConnectionCount = await server.countConnections();
        expect(postConnectionCount).to.equal(1);

        const disconnectPromise = server.events.closedConnection.once();
        netLink.disconnect();
        const disconnected = await disconnectPromise;
        expect(disconnected.socket).to.equal(listener);
        expect(disconnected.hadError).to.be.false;
    });

    it("cannot be constructed as a base class.", function () {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const BaseClass = (NetLinkSocketBase as unknown) as Function & {
            new (): void;
        };
        expect(() => new BaseClass()).to.throw();
    });

    it("can get blocking state", function () {
        const netLink = new NetLinkSocketClientTCP(localhost, port);
        netLink.setBlocking(true);
        expect(netLink.isBlocking()).to.be.true;
        netLink.setBlocking(false);
        expect(netLink.isBlocking()).to.be.false;
        netLink.disconnect();
    });
});
