import { expect } from "chai";
import { fork } from "child_process";
import { join, resolve } from "path";
import { TextEncoder } from "util";
import { badArg, tcpClientTester, udpTester, EchoUDP } from "./utils";
import { SocketUDP } from "../lib";

describe("client shared functionality", function () {
    for (const tester of [tcpClientTester, udpTester]) {
        tester.testPermutations((testing: typeof tester.testing) => {
            const echoPort = () =>
                testing.echo instanceof EchoUDP
                    ? testing.echo.getPort()
                    : testing.port;

            const send = (
                data: string | Buffer | Uint8Array = testing.str,
                client = testing.netLink,
            ) => {
                if (client instanceof SocketUDP) {
                    client.sendTo(testing.host, echoPort(), data);
                } else {
                    client.send(data);
                }
            };

            const receive = () => {
                if (testing.netLink instanceof SocketUDP) {
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
                // should be echoed back
                expect(sent.buffer.compare(buffer)).to.equal(0);

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

            it("can do blocking reads", async function () {
                testing.netLink.isBlocking = true;
                expect(testing.netLink.isBlocking).to.be.true;

                // shouldn't block here, nothing to read, returns undefined
                const sentPromise = testing.echo.events.sentData.once();
                send(testing.str);
                const sent = await sentPromise; // now it should be echoed back
                expect(sent.buffer.toString()).to.equal(testing.str);
                const read = receive();
                expect(read?.toString()).to.equal(testing.str);
            });

            it("can do non blocking reads", function () {
                testing.netLink.isBlocking = false;
                expect(testing.netLink.isBlocking).to.be.false;

                // shouldn't block here, nothing to read, returns undefined
                const read = receive();
                expect(read).to.be.undefined;
            });

            it("can do truly blocking read", async function () {
                // Note: Slow because child process needs to transpile TS code
                const testString = "Hello worker thread!";
                const newConnection = testing.echo.events.newConnection.once();
                const sentDataPromise = testing.echo.events.sentData.once();
                const closed = testing.echo.events.closedConnection.once();
                // unlike other tests, for this test, the netLink tests are all
                // in the worker code
                const workerPath = resolve(
                    join(__dirname, "./client.worker.ts"),
                );

                const worker = fork(workerPath, [], {
                    env: {
                        testPort: String(echoPort()),
                        testString,
                        testType:
                            testing.netLink instanceof SocketUDP
                                ? "UDP"
                                : "TCP",
                    },
                    execArgv: ["-r", "ts-node/register"],
                });

                await newConnection;
                const sent = await sentDataPromise;

                expect(sent.str).to.exist;
                expect(sent.str).to.equal(testString);

                await closed;

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
