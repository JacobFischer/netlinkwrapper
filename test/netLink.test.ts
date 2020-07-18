import { Socket } from "net";
import { netLinkWrapper } from "../src";
import { EchoServer } from "./echo-server";

const server = new EchoServer();
beforeAll(async () => server.listen());
afterAll(async () => server.close());

describe("netLinkWrapper", () => {
    it("is a function", () => {
        expect(typeof netLinkWrapper.prototype.connect).toBe("function");
    });

    it("can connect and disconnect", async () => {
        const connectionPromise = server.events.newConnection.once();

        const netLink = new netLinkWrapper();

        // should not be connected yet
        const preConnectionCount = await server.countConnections();
        expect(preConnectionCount).toBe(0);

        netLink.connect(server.port);
        const listener = await connectionPromise;
        expect(listener).toBeInstanceOf(Socket);

        // should now be the only connection
        const postConnectionCount = await server.countConnections();
        expect(postConnectionCount).toBe(1);

        const disconnectPromise = server.events.closedConnection.once();
        netLink.disconnect();
        const disconnected = await disconnectPromise;
        expect(disconnected.socket).toStrictEqual(listener);
        expect(disconnected.hadError).toBe(false);
    });

    it("can write strings", async () => {
        const dataPromise = server.events.sentData.once();
        const listenerPromise = server.events.newConnection.once();

        const netLink = new netLinkWrapper();
        netLink.connect(server.port);
        const listener = await listenerPromise;

        const sending = "Make it so number one.";
        // console.log("about to send", sending);
        netLink.write(sending);
        const sent = await dataPromise;
        expect(sent.data).toStrictEqual(sending);
        expect(sent.socket).toStrictEqual(listener);

        netLink.disconnect();
        // await server.events.closedConnection.once();
    });
});
