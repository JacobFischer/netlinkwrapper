import { createServer, Server, Socket } from "net";
import { Event, events } from "ts-typed-events";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoServer {
    /** The port this server listens on. */
    public readonly port = 40820;

    public readonly server: Server;
    public readonly listeners = new Set<Socket>();

    public readonly events = events({
        newConnection: new Event<Socket>(),
        closedConnection: new Event<{
            socket: Socket;
            hadError: boolean;
        }>(),
        sentData: new Event<{
            socket: Socket;
            data: Buffer;
        }>(),
    });

    constructor() {
        this.server = createServer((socket) => {
            this.listeners.add(socket);
            socket.on("close", (hadError) => {
                this.listeners.delete(socket);
                this.events.closedConnection.emit({ socket, hadError });
            });
            this.events.newConnection.emit(socket);

            // echo all data back
            socket.on("data", (data) => {
                // console.log("ECHO", data.toString());
                this.events.sentData.emit({ socket, data });
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

    public broadcast(data: string): Promise<unknown> {
        return Promise.all(
            Array.from(this.listeners).map(
                (listener) =>
                    new Promise((resolve, reject) =>
                        listener.write(data, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        }),
                    ),
            ),
        );
    }
}
