import { EchoServer } from "./echo-server";
import { NetLinkSocketBase } from "../../lib";

export type TestingSetup = {
    netLink: NetLinkSocketBase;
    server: EchoServer;
    beforeEachTest: () => Promise<void>;
    afterEachTest: () => Promise<void>;
};

export type TestingSetupFunction = (
    host: string,
    port: number,
) => TestingSetup;

export const createTestingSetup = (
    newNetLinkSocket: (host: string, port: number) => NetLinkSocketBase,
    newEchoServer: (port: number) => EchoServer,
): TestingSetupFunction => (host: string, port: number): TestingSetup => {
    const server = newEchoServer(port);

    const container: TestingSetup = {
        netLink: (null as unknown) as NetLinkSocketBase,
        server,
        beforeEachTest: async () => {
            const connectionPromise = server.events.newConnection.once();
            await server.listen();
            container.netLink = newNetLinkSocket(host, port);
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
};
