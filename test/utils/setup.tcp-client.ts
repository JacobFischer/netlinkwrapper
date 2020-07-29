import { createServer, Server, Socket as SocketTCP } from "net";
import { BaseContainer, hashTestingDataInto, newContainer } from "./hash";
import { EchoSocket } from "./echo-socket";
import { TestingSetupFunction } from "./setup";
import { NetLinkSocketClientTCP } from "../../lib";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoServerTCP extends EchoSocket<SocketTCP> {
    private readonly server: Server;

    constructor() {
        super();
        this.server = createServer((socket) => {
            socket.on("close", (hadError) => {
                this.events.closedConnection.emit({ from: socket, hadError });
            });
            this.events.newConnection.emit(socket);

            // echo all data back
            socket.on("data", (buffer) => {
                const str = buffer.toString();
                this.events.sentData.emit({ from: socket, buffer, str });
                socket.write(buffer);
            });
        });
    }

    public start(c: BaseContainer): Promise<void> {
        return new Promise((resolve) => this.server.listen(c.port, resolve));
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) =>
            this.server.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }),
        );
    }

    public countConnections(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.server.getConnections((err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    }
}

/*
export const setupTestingForClientTCP = createTestUtil(
    (host, port) => new NetLinkSocketClientTCP(host, port),
    (_, port) => new EchoServerTCP(port),
);
*/

export const setupTestingForClientTCP: TestingSetupFunction<
    NetLinkSocketClientTCP,
    EchoServerTCP
> = (suite: Mocha.Suite) => {
    const server = new EchoServerTCP();

    const container = newContainer({
        netLink: (null as unknown) as NetLinkSocketClientTCP,
        echo: server,
    });

    suite.beforeEach(async function () {
        hashTestingDataInto(this, container);
        const connectionPromise = server.events.newConnection.once();
        await server.start(container);
        container.netLink = new NetLinkSocketClientTCP(
            container.host,
            container.port,
        );
        await connectionPromise;
    });

    suite.afterEach(async () => {
        const hasConnections = (await server.countConnections()) > 0;
        const disconnectPromise =
            hasConnections && server.events.closedConnection.once();

        if (!container.netLink.isDestroyed()) {
            container.netLink.disconnect();
        }
        await disconnectPromise;
        await server.stop();
    });

    return container;
};
