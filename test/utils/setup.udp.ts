import { createSocket, RemoteInfo } from "dgram";
import { BaseContainer, hashTestingDataInto, newContainer } from "./hash";
import { EchoSocket } from "./echo-socket";
import { TestingSetupFunction } from "./setup";
import { NetLinkSocketUDP } from "../../lib";

// upd6 will accept IPv4/6 connections so it is ideal for testing with
const newUDP = () => createSocket({ type: "udp6" });

export class EchoUDP extends EchoSocket<RemoteInfo> {
    private socket = newUDP();

    public start(data: BaseContainer): Promise<void> {
        return new Promise((resolve) => {
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

            this.socket.bind(data.port, resolve);
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
    const container = newContainer({
        netLink: (null as unknown) as NetLinkSocketUDP,
        echo: new EchoUDP(),
    });

    suite.beforeEach(async function () {
        hashTestingDataInto(this, container);
        await container.echo.start(container);
        container.netLink = new NetLinkSocketUDP(
            container.host,
            container.port,
        );
    });
    suite.afterEach(async () => {
        if (!container.netLink.isDestroyed()) {
            container.netLink.disconnect();
        }
        await container.echo.stop();
    });

    return container;
};
