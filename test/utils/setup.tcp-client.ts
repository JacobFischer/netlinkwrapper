import { createServer, Server, Socket as SocketTCP } from "net";
import { EchoServer } from "./echo-server";
import { TestingSetupFunction } from "./setup";
import { NetLinkSocketClientTCP } from "../../lib";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoServerTCP extends EchoServer<SocketTCP> {
    private readonly server: Server;
    private readonly listeners = new Set<SocketTCP>();

    constructor(port: number) {
        super(port);

        this.server = createServer((socket) => {
            this.listeners.add(socket);
            socket.on("close", (hadError) => {
                this.listeners.delete(socket);
                this.events.closedConnection.emit({ from: socket, hadError });
            });
            this.events.newConnection.emit(socket);

            // echo all data back
            socket.on("data", (buffer) => {
                const data = buffer.toString();
                // console.log("ECHO", data.toString());
                this.events.sentData.emit({ from: socket, data });
                socket.write(data);
            });
        });
    }

    public listen(): Promise<void> {
        return new Promise((resolve) =>
            this.server.listen(this.port, resolve),
        );
    }

    public close(): Promise<void> {
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

export const createTestingSetupClientTCP: TestingSetupFunction = (
    host,
    port,
) => {
    const server = new EchoServerTCP(port) as EchoServer;

    const container = {
        netLink: (null as unknown) as NetLinkSocketClientTCP,
        server,
        beforeEachTest: async () => {
            const connectionPromise = server.events.newConnection.once();
            await server.listen();
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
};
