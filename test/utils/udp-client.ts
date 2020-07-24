import { createSocket } from "dgram";
import { NetLinkSocketClientUDP } from "../../lib";

/**
 * @param host
 * @param port
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
        beforeEachTest: async () => {
            // await new Promise((resolve) => server.bind(port, resolve));
            container.netLink = new NetLinkSocketClientUDP(host, port);
        },
        afterEachTest: async () => {
            container.netLink.disconnect();
            // await new Promise((resolve) => server.close(resolve));
        },
    };

    return container;
}
