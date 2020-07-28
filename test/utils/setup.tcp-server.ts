import { AddressInfo, Socket as SocketTCP } from "net";
import { testingAddress } from "./address";
import { EchoSocket } from "./echo-socket";
import { TestingSetupFunction } from "./setup";
import { NetLinkSocketServerTCP } from "../../lib";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoClientTCP extends EchoSocket<AddressInfo> {
    private socket!: SocketTCP;

    public start(host?: string): Promise<void> {
        return new Promise((resolve) => {
            this.socket = new SocketTCP();
            this.socket.on("data", (data) => {
                const address = this.socket.address();
                if (typeof address === "string") {
                    throw new Error("Running on too old a Node version!");
                }
                this.events.newConnection.emit(address);
                this.socket.write(data, () => {
                    this.events.sentData.emit({
                        from: address,
                        data: data.toString(),
                    });
                    this.events.closedConnection.emit({
                        from: address,
                        hadError: false,
                    });
                });
            });
            this.socket.connect(this.port, String(host), () => {
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

export const setupTestingForServerTCP: TestingSetupFunction<
    NetLinkSocketServerTCP,
    EchoClientTCP
> = (suite: Mocha.Suite) => {
    const [host, port] = testingAddress(suite.fullTitle());

    const container = {
        netLink: (null as unknown) as NetLinkSocketServerTCP,
        echo: new EchoClientTCP(port),
        host,
        port,
    };

    suite.beforeEach(async () => {
        container.netLink = new NetLinkSocketServerTCP(
            port,
            undefined,
            "IPv4", // when set to IPv4 this does not work.
        );
        await container.echo.start(host);
    });

    suite.afterEach(async () => {
        await container.echo.stop();
        if (!container.netLink.isDestroyed()) {
            container.netLink.disconnect();
        }
    });

    return container;
};
