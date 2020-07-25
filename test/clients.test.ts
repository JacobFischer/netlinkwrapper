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

                const read = testing.netLink.read();
                expect(read).to.be.instanceOf(Buffer);
                expect(read && read.toString()).to.equal(sentString);
            });

            it("can read specific buffer lengths", async function () {
                if (!isTCP) {
                    // eslint-disable-next-line no-console
                    console.log("TODO: get this working for TCP");
                    return;
                }
                const dataPromise = testing.server.events.sentData.once();

                const str = "Attack of the Clones";
                const sending = str.repeat(2);
                testing.netLink.write(sending); // send the same string twice
                const sent = await dataPromise;
                expect(sent.data).to.equal(sending);
                const readHalf = testing.netLink.read(str.length);
                const readHalfString = readHalf?.toString() || "";
                expect(readHalfString).to.equal(str);
                const readOtherHalf = testing.netLink.read();
                const readOtherHalfString = readOtherHalf?.toString() || "";
                expect(readOtherHalfString).to.equal(str);
                expect(readHalfString).to.equal(readOtherHalfString);
                expect(readOtherHalfString + readOtherHalfString).to.equal(
                    sent.data,
                );
            });

            it("throws on illegal reads", function () {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return,  @typescript-eslint/no-explicit-any
                const fakeOutTS = (val: unknown): number => val as any;
                expect(() => testing.netLink.read(fakeOutTS("1337"))).to.throw;
                expect(() => testing.netLink.read(-1)).to.throw;

                expect(() =>
                    testing.netLink.read(Number.MAX_SAFE_INTEGER),
                ).to.throw();
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
                expect(testing.netLink.getNextReadSize()).to.equal(
                    serverSent.data.length,
                );
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
