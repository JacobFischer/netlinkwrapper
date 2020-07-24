import { EchoServerTCP } from "./tcp-echo-server";
import { NetLinkSocketClientTCP } from "../../lib";

/**
 * Setup helper for TCP clients.
 *
 * @param host - The host to connect to for tests.
 * @param port - The port to connect to for tests.
 * @returns An instance of a TCP Client testing container.
 */
export function setupTestingClientTCP(
    host: string,
    port: number,
): {
    netLink: NetLinkSocketClientTCP;
    beforeEachTest: () => Promise<void>;
    afterEachTest: () => Promise<void>;
} {
    const server = new EchoServerTCP();

    const container = {
        netLink: (null as unknown) as NetLinkSocketClientTCP,
        beforeEachTest: async () => {
            const connectionPromise = server.events.newConnection.once();
            await server.listen(port);
            container.netLink = new NetLinkSocketClientTCP(host, port);
            await connectionPromise;
        },
        afterEachTest: async () => {
            const disconnectPromise = server.events.closedConnection.once();
            container.netLink.disconnect();
            await disconnectPromise;
            await server.close();
        },
    };

    return container;
}
