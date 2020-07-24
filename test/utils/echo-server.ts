import { createServer, Server, Socket as SocketTCP } from "net";
import { createSocket, RemoteInfo, Socket as SocketUDP } from "dgram";
import { Event, events } from "ts-typed-events";

export abstract class EchoServer<T = unknown> {
    public readonly events = events({
        newConnection: new Event<T>(),
        closedConnection: new Event<{
            from: T;
            hadError: boolean;
        }>(),
        sentData: new Event<{
            from: T;
            data: string;
        }>(),
    });

    constructor(public readonly port: number) {
        // pass
    }

    public abstract listen(): Promise<void>;
    public abstract close(): Promise<void>;
    public abstract countConnections(): Promise<number>;
}

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

const newUDP = () => createSocket({ type: "udp6" });

export class EchoServerUDP extends EchoServer<RemoteInfo> {
    private socket: SocketUDP;

    constructor(port: number) {
        super(port);

        this.socket = newUDP();
    }

    public listen(): Promise<void> {
        return new Promise((resolve) => {
            this.socket = newUDP();

            this.socket.on("message", (message, remote) => {
                // UDP does not form true connections, so we will "fake" it
                this.events.newConnection.emit(remote);
                this.events.sentData.emit({
                    from: remote,
                    data: message.toString(),
                });
                this.events.closedConnection.emit({
                    from: remote,
                    hadError: false,
                });
            });

            this.socket.bind(this.port, resolve);
        });
    }

    public close(): Promise<void> {
        return new Promise((resolve) => this.socket.close(resolve));
    }

    public countConnections(): Promise<number> {
        return new Promise((resolve) => {
            resolve(0); // UDP does not have true connections
        });
    }
}
