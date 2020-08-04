import { AddressInfo, Socket as SocketTCP } from "net";
import { EchoSocket } from "./echo-socket";
import { Tester } from "./tester";
import { NetLinkSocketServerTCP } from "../../lib";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoClientTCP extends EchoSocket<AddressInfo> {
    private socket!: SocketTCP;

    public start(data: { host: string; port: number }): Promise<void> {
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

export class TesterServerTCP extends Tester<
    NetLinkSocketServerTCP,
    EchoClientTCP
> {
    public static readonly tests = "TCP Server";

    constructor(suite: Mocha.Suite) {
        super(
            suite,
            new EchoClientTCP(),
            ({ port }) => new NetLinkSocketServerTCP(port),
            false,
        );
    }
}
