import { Socket } from "net";
import { netLinkWrapper } from "../src";
import { EchoServer } from "./echo-server";

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

const server = new EchoServer();
beforeAll(async () => await server.listen());
afterAll(async () => {
    await server.close();
    // HACK: here's the deal, mocha will tear down test workers before v8
    // cleans up the sockets we are testing with
    // If this happens on Mac/Linux system you will see segfaults **just** in
    // tests. If it happens in Windows you can see that, and the port will
    // remain blocked untill you kill processes or reboot your computer.
    // Not condusive to testing.
    // A 1 second delay solves all this magically :P
    await delay(1000);
});

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
        netLink.write(sending);
        const sent = await dataPromise;
        expect(sent.data.toString()).toStrictEqual(sending);
        expect(sent.socket).toStrictEqual(listener);

        netLink.read(1024);
        netLink.disconnect();
        await server.events.closedConnection.once();
    });
    //*/
});
