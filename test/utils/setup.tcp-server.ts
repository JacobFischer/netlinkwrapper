import { AddressInfo, Socket as SocketTCP } from "net";
import { BaseContainer, hashTestingDataInto, newContainer } from "./hash";
import { EchoSocket } from "./echo-socket";
import { TestingSetupFunction } from "./setup";
import { NetLinkSocketServerTCP } from "../../lib";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoClientTCP extends EchoSocket<AddressInfo> {
    private socket!: SocketTCP;

    public start(data: BaseContainer): Promise<void> {
        return new Promise((resolve) => {
            this.socket = new SocketTCP();
            this.socket.on("data", (buffer) => {
                const address = this.socket.address();
                if (typeof address === "string") {
                    throw new Error("Running on too old a Node version!");
                }
                this.events.newConnection.emit(address);
                this.socket.write(buffer, () => {
                    this.events.sentData.emit({
                        from: address,
                        buffer,
                        str: buffer.toString(),
                    });
                    this.events.closedConnection.emit({
                        from: address,
                        hadError: false,
                    });
                });
            });
            this.socket.connect(data.port, data.host, () => {
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            this.socket.on("close", resolve);
            this.socket.destroy();
        });
    }
}

/*
export const setupTestingForServerTCP = createTestUtil(
    (host, port) => new NetLinkSocketServerTCP(port, host),
    (_, port) => new EchoServerTCP(port),
    true,
);
*/

export const setupTestingForServerTCP: TestingSetupFunction<
    NetLinkSocketServerTCP,
    EchoClientTCP
> = (suite: Mocha.Suite) => {
    const container = newContainer({
        netLink: (null as unknown) as NetLinkSocketServerTCP,
        echo: new EchoClientTCP(),
    });

    suite.beforeEach(async function () {
        hashTestingDataInto(this, container);
        container.netLink = new NetLinkSocketServerTCP(container.port);
        await container.echo.start(container);
    });

    suite.afterEach(async () => {
        await container.echo.stop();
        if (!container.netLink.isDestroyed()) {
            container.netLink.disconnect();
        }
    });

    return container;
};
