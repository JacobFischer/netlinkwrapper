// import { createSocket } from "dgram";
import { NetLinkSocketClientUDP } from "../../lib";

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
    // const server = createSocket({ type: "udp6" });

    const container = {
        netLink: (null as unknown) as NetLinkSocketClientUDP,
        beforeEachTest: () => {
            // await new Promise((resolve) => server.bind(port, resolve));
            container.netLink = new NetLinkSocketClientUDP(host, port);
        },
        afterEachTest: () => {
            container.netLink.disconnect();
            // await new Promise((resolve) => server.close(resolve));
        },
    };

    return container;
}
