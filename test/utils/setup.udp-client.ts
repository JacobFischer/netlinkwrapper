import { createSocket, RemoteInfo, Socket } from "dgram";
import { testingAddress } from "./address";
import { EchoServer } from "./echo-server";
import { TestingSetupFunction } from "./setup";
import { NetLinkSocketClientUDP } from "../../lib";

// upd6 will accept IPv4/6 conenctions so it is ideal for testing with
const newUDP = () => createSocket({ type: "udp6" });

export class EchoServerUDP extends EchoServer<RemoteInfo> {
    private socket: Socket;

    constructor(port: number) {
        super(port);

        this.socket = newUDP();
    }

    public listen(): Promise<void> {
        return new Promise((resolve) => {
            this.socket = newUDP();

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.socket.on("message", async (message, remote) => {
                // UDP does not form true connections, so we will "fake" it
                const data = message.toString();

                this.events.newConnection.emit(remote);

                // echo it back
                await new Promise((res, rej) =>
                    this.socket.send(
                        data,
                        remote.port,
                        remote.address,
                        (err, val) => {
                            if (err) {
                                rej(err);
                            } else {
                                res(val);
                            }
                        },
                    ),
                );

                this.events.sentData.emit({
                    from: remote,
                    data,
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
        return new Promise((resolve) => {
            this.socket.close(() => {
                this.socket = newUDP(); // current socket is done, need a new one for next use
                resolve();
            });
        });
    }

    public countConnections(): Promise<number> {
        return new Promise((resolve) => {
            resolve(0); // UDP does not have true connections
        });
    }
}

export const createTestingSetupClientUDP: TestingSetupFunction<
    NetLinkSocketClientUDP,
    EchoServerUDP
> = (suite) => {
    const [host, port] = testingAddress(suite.fullTitle());
    const server = new EchoServerUDP(port);

    const container = {
        netLink: (null as unknown) as NetLinkSocketClientUDP,
        server,
        host,
        port,
    };

    suite.beforeEach(async () => {
        await server.listen();
        container.netLink = new NetLinkSocketClientUDP(host, port);
    });
    suite.afterEach(async () => {
        container.netLink.disconnect();
        await server.close();
    });

    return container;
};
