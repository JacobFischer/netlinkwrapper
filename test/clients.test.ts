import { expect } from "chai";
import { fork } from "child_process";
import { join, resolve } from "path";
import { TextEncoder } from "util";
import { badArg, TesterClientTCP, TesterUDP } from "./utils";
import { NetLinkSocketClientTCP, NetLinkSocketUDP } from "../lib";

describe("clients shared functionality", function () {
    for (const Tester of [TesterClientTCP, TesterUDP]) {
        describe(Tester.tests, function () {
            const testing = new Tester(this);

            const send = (
                data: string | Buffer | Uint8Array = testing.str,
                client = testing.netLink,
            ) => {
                if (client instanceof NetLinkSocketUDP) {
                    client.sendTo(testing.host, testing.port, data);
                } else {
                    client.send(data);
                }
            };

            const receive = () => {
                if (testing.netLink instanceof NetLinkSocketUDP) {
                    const got = testing.netLink.receiveFrom();
                    return got?.data;
                } else {
                    return testing.netLink.receive();
                }
            };

            it("exists", function () {
                expect(testing.netLink).to.exist;
            });

            it("can read and write strings", async function () {
                const dataPromise = testing.echo.events.sentData.once();
                send(testing.str);
                const sent = await dataPromise;
                expect(sent.str).to.equal(testing.str); // should be echoed back

                const read = receive();
                expect(read).to.be.instanceOf(Buffer);
                expect(read?.compare(sent.buffer)).to.equal(0);
            });

            it("can send Buffers", async function () {
                const dataPromise = testing.echo.events.sentData.once();

                const buffer = Buffer.from(testing.str);
                send(buffer);
                const sent = await dataPromise;
                expect(sent.buffer.compare(buffer)).to.equal(0); // should be echoed back

                const read = receive();
                expect(read?.compare(buffer)).to.equal(0);
            });

            it("can send Uint8Arrays", async function () {
                const dataPromise = testing.echo.events.sentData.once();

                const uint8array = new TextEncoder().encode(testing.str);
                send(uint8array);
                const sent = await dataPromise;
                expect(sent.str).to.equal(testing.str); // should be echoed back

                const read = receive();
                expect(read?.toString()).to.equal(testing.str);
            });

            it("cannot send invalid date", function () {
                expect(() => send(badArg())).to.throw();
            });

            it("can do non blocking reads", function () {
                testing.netLink.isBlocking = false;

                // shouldn't block here, nothing to read, returns undefined
                const read = receive();
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
                        testType: Tester.tests,
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

            it("can be IPv6", async function () {
                const sentData = testing.echo.events.sentData.once();
                const localhostIPv6 = "::1";
                const client =
                    testing.netLink instanceof NetLinkSocketUDP
                        ? new NetLinkSocketUDP(undefined, undefined, "IPv6")
                        : new NetLinkSocketClientTCP(
                              testing.port,
                              localhostIPv6,
                              "IPv6",
                          );

                send("Hello!", client);
                const sent = await sentData;
                // server always sees IPv6 addresses so no need to check
                // getting data means it formed the connection,
                // thus the IPv6 address works
                expect(sent.from).to.exist;
                expect(client.isIPv6).to.be.true;
                client.disconnect();
            });

            it("cannot receive once disconnected", function () {
                testing.netLink.disconnect();
                expect(() => receive()).to.throw();
            });

            it("cannot send once disconnected", function () {
                testing.netLink.disconnect();
                expect(() => send()).to.throw();
            });
        });
    }
});
