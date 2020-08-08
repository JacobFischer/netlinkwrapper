import { AddressInfo, Socket as SocketTCP } from "net";
import { EchoSocket } from "./echo-socket";
import { Tester } from "./tester";
import { NetLinkSocketServerTCP } from "../../lib";

/**
 * A simple Echo Server for testing.
 * Basically async/await syntax for clearer testing code.
 */
export class EchoServerTCP extends EchoSocket<AddressInfo> {
    private socket!: SocketTCP;

    public start(data: {
        host: string;
        port: number;
        ipVersion?: "IPv4" | "IPv6";
    }): Promise<void> {
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
            this.socket.connect(
                {
                    host: data.host,
                    port: data.port,
                    family: data.ipVersion === "IPv6" ? 6 : 4,
                },
                resolve,
            );
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            this.socket.on("close", resolve);
            this.socket.destroy();
        });
    }
}

export const tcpServerTester = new Tester(
    NetLinkSocketServerTCP,
    EchoServerTCP,
    {
        startEchoAfterNetLink: true,
        newPermute: ["host"],
    },
);
