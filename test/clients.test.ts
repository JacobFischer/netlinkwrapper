import { expect } from "chai";
import { fork } from "child_process";
import { join, resolve } from "path";
import { TextEncoder } from "util";
import { setups } from "./utils";
import { NetLinkSocketClientTCP, NetLinkSocketUDP } from "../lib";

const clientSetups = [setups.tcpClient, setups.udp];

describe("clients shared functionality", function () {
    for (const { setup, isTCP } of clientSetups) {
        const testType = isTCP ? "TCP" : "UDP";
        describe(`${testType} client`, function () {
            const testing = setup(this);

            it("exists", function () {
                expect(testing.netLink).to.exist;
            });

            it("can read and write strings", async function () {
                const dataPromise = testing.echo.events.sentData.once();
                testing.netLink.send(testing.str);
                const sent = await dataPromise;
                expect(sent.str).to.equal(testing.str); // should be echoed back

                const read = testing.netLink.receive();
                expect(read).to.be.instanceOf(Buffer);
                expect(read?.compare(sent.buffer)).to.equal(0);
            });

            it("can send Buffers", async function () {
                const dataPromise = testing.echo.events.sentData.once();

                const buffer = Buffer.from(testing.str);
                testing.netLink.send(buffer);
                const sent = await dataPromise;
                expect(sent.buffer.compare(buffer)).to.equal(0); // should be echoed back

                const read = testing.netLink.receive();
                expect(read?.compare(buffer)).to.equal(0);
            });

            it("can send Uint8Arrays", async function () {
                const dataPromise = testing.echo.events.sentData.once();

                const uint8array = new TextEncoder().encode(testing.str);
                testing.netLink.send(uint8array);
                const sent = await dataPromise;
                expect(sent.str).to.equal(testing.str); // should be echoed back

                const read = testing.netLink.receive();
                expect(read?.toString()).to.equal(testing.str);
            });

            it("can do non blocking reads", function () {
                testing.netLink.setBlocking(false);

                const read = testing.netLink.receive();
                expect(read).to.be.undefined;
            });

            it("can do blocking reads", async function () {
                // Slow because child process need ts-node transpiling on the fly
                this.timeout(10_000);

                const testString = "Hello worker thread!";
                const newConnectionPromise = testing.echo.events.newConnection.once();
                const sentDataPromise = testing.echo.events.sentData.once();
                const disconnectedPromise = testing.echo.events.closedConnection.once();
                // unlike other tests, the netLink tests are all in the worker code
                const workerPath = resolve(
                    join(__dirname, "./client.worker.ts"),
                );
                const worker = fork(workerPath, [], {
                    env: {
                        testPort: String(testing.port),
                        testString,
                        testType,
                    },
                    execArgv: ["-r", "ts-node/register"],
                });

                await newConnectionPromise;
                const sent = await sentDataPromise;

                expect(sent.str).to.exist;
                expect(sent.str).to.equal(testString);

                await disconnectedPromise;

                const code = await new Promise((resolve, reject) =>
                    worker.on("exit", (code) => {
                        if (code) {
                            reject(
                                new Error(
                                    `Worker process exited with code ${code}`,
                                ),
                            );
                        } else {
                            resolve(code);
                        }
                    }),
                );
                expect(code).to.equal(0);
            });

            it("can get host/port to", function () {
                const hostTo = testing.netLink.getHostTo();
                expect(typeof hostTo).to.equal("string");
                expect(hostTo).to.equal(testing.host);

                const portTo = testing.netLink.getPortTo();
                expect(typeof portTo).to.equal("number");
                expect(portTo).to.equal(testing.port);
            });

            it("can be IPv6", async function () {
                const sentData = testing.echo.events.sentData.once();
                const localhostIPv6 = "::1";
                const client = isTCP
                    ? new NetLinkSocketClientTCP(
                          localhostIPv6,
                          testing.port,
                          "IPv6",
                      )
                    : new NetLinkSocketUDP(
                          localhostIPv6,
                          testing.port,
                          undefined,
                          "IPv6",
                      );

                client.send("Hello!");
                const sent = await sentData;
                // server always sees IPv6 addresses so no need to check
                // getting data means it formed the connection,
                // thus the IPv6 address works
                expect(sent.from).to.exist;
                expect(client.isIPv6()).to.be.true;
                client.disconnect();
            });
        });
    }
});
