import { createSocket, RemoteInfo, Socket } from "dgram";
import { testingAddress } from "./address";
import { EchoSocket } from "./echo-socket";
import { TestingSetupFunction } from "./setup";
import { NetLinkSocketUDP } from "../../lib";

// upd6 will accept IPv4/6 connections so it is ideal for testing with
const newUDP = () => createSocket({ type: "udp6" });

export class EchoUDP extends EchoSocket<RemoteInfo> {
    private socket: Socket;

    constructor(port: number) {
        super(port);

        this.socket = newUDP();
    }

    public start(): Promise<void> {
        return new Promise((resolve) => {
            this.socket = newUDP();

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.socket.on("message", async (buffer, remote) => {
                // UDP does not form true connections, so we will "fake" it
                this.events.newConnection.emit(remote);

                // echo it back
                await new Promise((res, rej) =>
                    this.socket.send(
                        buffer,
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
                    buffer,
                    str: buffer.toString(),
                });

                this.events.closedConnection.emit({
                    from: remote,
                    hadError: false,
                });
            });

            this.socket.bind(this.port, resolve);
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            this.socket.close(() => {
                this.socket = newUDP(); // current socket is done, need a new one for next use
                resolve();
            });
        });
    }
}

/*
export const setupTestingForUDP = createTestUtil(
    (host, port) => new NetLinkSocketUDP(host, port),
    (_, port) => new EchoUDP(port),
);
*/

export const setupTestingForUDP: TestingSetupFunction<
    NetLinkSocketUDP,
    EchoUDP
> = (suite) => {
    const [host, port] = testingAddress(suite.fullTitle());
    const echo = new EchoUDP(port);

    const container = {
        netLink: (null as unknown) as NetLinkSocketUDP,
        echo,
        host,
        port,
    };

    suite.beforeEach(async () => {
        await echo.start();
        container.netLink = new NetLinkSocketUDP(host, port);
    });
    suite.afterEach(async () => {
        if (!container.netLink.isDestroyed()) {
            container.netLink.disconnect();
        }
        await echo.stop();
    });

    return container;
};
