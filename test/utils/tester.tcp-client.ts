import { Server, Socket as SocketTCP } from "net";
import { EchoSocket } from "./echo-socket";
import { Tester } from "./tester";
import { NetLinkSocketClientTCP } from "../../lib";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoServerTCP extends EchoSocket<SocketTCP> {
    private readonly server: Server;

    constructor() {
        super();
        this.server = new Server((socket) => {
            socket.on("close", (hadError) => {
                this.events.closedConnection.emit({ from: socket, hadError });
            });

            // echo all data back
            socket.on("data", (buffer) => {
                const str = buffer.toString();
                this.events.sentData.emit({ from: socket, buffer, str });
                socket.write(buffer);
            });

            this.events.newConnection.emit(socket);
        });
    }

    public start(s: { port: number }): Promise<void> {
        return new Promise((resolve) => this.server.listen(s.port, resolve));
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

export class TesterClientTCP extends Tester<
    NetLinkSocketClientTCP,
    EchoServerTCP
> {
    public static readonly tests = "TCP Client";

    constructor(suite: Mocha.Suite) {
        super(
            suite,
            new EchoServerTCP(),
            ({ port, host }) => new NetLinkSocketClientTCP(port, host),
            true,
            async ({ echo }) => {
                await echo.events.newConnection.once();
            },
        );
    }
}
