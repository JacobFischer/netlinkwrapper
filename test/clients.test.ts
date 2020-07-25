import { testingClients } from "./utils";
import { expect } from "chai";
import { fork } from "child_process";
import { join, resolve } from "path";

describe("clients shared functionality", function () {
    for (const { setup, isTCP } of testingClients) {
        const testType = isTCP ? "TCP" : "UDP";
        describe(`${testType} client`, function () {
            const testing = setup(this);

            /*
            it("can read and write strings", async function () {
                const dataPromise = testing.server.events.sentData.once();

                const sending = "Make it so number one.";
                testing.netLink.write(sending);
                const sent = await dataPromise;
                const sentString = sent.data.toString();
                expect(sentString).to.equal(sending); // should be echoed back

                const read = testing.netLink.read();
                expect(read).to.be.instanceOf(Buffer);
                expect(read && read.toString()).to.equal(sentString);
            });

            it("can do non blocking reads", function () {
                testing.netLink.setBlocking(false);

                const read = testing.netLink.read();
                expect(read).to.be.undefined;
            });

            it("can get next read size", async function () {
                expect(testing.netLink.getNextReadSize()).to.equal(0);
                const dataPromise = testing.server.events.sentData.once();
                const sending = "over three months";
                testing.netLink.write(sending);
                const serverSent = await dataPromise;
                // getNextReadSize can be >= the actual data size on mac
                // not sure why at this time...
                expect(
                    testing.netLink.getNextReadSize() + 1,
                ).to.be.greaterThan(serverSent.data.length);
            });
            */

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
                worker.stdout?.on("data", (data) => {
                    console.log(`stdout: ${data}`);
                });

                worker.stderr?.on("data", (data) => {
                    console.error(`stderr: ${data}`);
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
