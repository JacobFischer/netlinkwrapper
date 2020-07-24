import { createSocket } from "dgram";
import { NetLinkSocketClientUDP } from "../../lib";

// upd6 will accept IPv4/6 conenctions so it is ideal for testing with
const newUDP = () => createSocket({ type: "udp6" });

/**
 * Setup helper for UDP clients.
 *
 * @param host - The host to connect to for tests.
 * @param port - The port to connect to for tests.
 * @returns An instance of a UDP Client testing container.
 */
export function setupTestingClientUDP(
    host: string,
    port: number,
): {
    netLink: NetLinkSocketClientUDP;
    beforeEachTest: () => Promise<void>;
    afterEachTest: () => Promise<void>;
} {
    let server = newUDP();

    const container = {
        netLink: (null as unknown) as NetLinkSocketClientUDP,
        beforeEachTest: async () => {
            await new Promise((resolve) => server.bind(port, resolve));
            container.netLink = new NetLinkSocketClientUDP(host, port);
        },
        afterEachTest: async () => {
            container.netLink.disconnect();
            await new Promise((resolve) => server.close(resolve));
            server = newUDP(); // for the next run
        },
    };

    return container;
}
