import { testingClients } from "./utils";
import { expect } from "chai";
import { fork } from "child_process";
import { join, resolve } from "path";

describe("clients shared functionality", function () {
    for (const { setup, isTCP } of testingClients) {
        const testType = isTCP ? "TCP" : "UDP";
        describe(`${testType} client`, function () {
            const testing = setup(this);

            it("can read and write strings", async function () {
                const dataPromise = testing.server.events.sentData.once();

                const sending = "Make it so number one.";
                testing.netLink.write(sending);
                const sent = await dataPromise;
                const sentString = sent.data.toString();
                expect(sentString).to.equal(sending); // should be echoed back

                const read = testing.netLink.read(1024);
                expect(read).to.be.instanceOf(Buffer);
                expect(read && read.toString()).to.equal(sentString);
            });

            it("can do non blocking reads", function () {
                testing.netLink.setBlocking(false);

                const read = testing.netLink.read(1024);
                expect(read).to.be.undefined;
            });

            it("can do blocking reads", async function () {
                this.timeout(10_000); // slow because child process need ts-node transpiling on the fly

                const testString = "Hello worker thread!";
                const newConnectionPromise = testing.server.events.newConnection.once();
                const sentDataPromise = testing.server.events.sentData.once();
                const disconnectedPromise = testing.server.events.closedConnection.once();
                // unlike other tests, the netlink tests are all in the worker code
                const workerPath = resolve(
                    join(__dirname, "./client.worker.ts"),
                );
                const worker = fork(workerPath, [], {
                    env: {
                        testPort: String(testing.server.port),
                        testString,
                        testType,
                    },
                    execArgv: ["-r", "ts-node/register"],
                });

                await newConnectionPromise;
                const sent = await sentDataPromise;

                expect(sent.data).to.exist;
                expect(sent.data && sent.data.toString()).to.equal(testString);

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
        });
    }
});
