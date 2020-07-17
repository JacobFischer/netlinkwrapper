"use strict";

var spawn = require("child_process").spawn;

describe("TCP communication", function () {
    var serverIsReady = false;
    var waitsServerStart = 0;
    var serverHasResponded = false;
    var serverHasSaidBye = false;
    var waitsClient = 0;
    var waitDelay = 20;
    var maxWaits = 10;

    var serverProcess;
    var clientProcess;

    beforeEach(function (done) {
        startServer();
        waitUntilServerIsReady(done);
    });

    afterEach(function () {
        if (serverProcess) {
            serverProcess.kill();
        }
        if (clientProcess) {
            clientProcess.kill();
        }
    });

    it("should work", function (done) {
        startClient();
        waitUntilCommunicationHasHappened(done);
    });

    function startServer() {
        serverProcess = spawn("node", ["test/apps/server"], {
            stdio: [0, "pipe", process.stderr],
        });

        serverProcess.stdout.on("data", (data) => {
            var str = data.toString();
            console.log("[server stdout]:", str);
            if (str.indexOf("server is listening on port 3000") >= 0) {
                serverIsReady = true;
            }
        });
    }

    function waitUntilServerIsReady(callback) {
        if (serverIsReady) {
            process.nextTick(function () {
                callback();
            });
        } else {
            waitsServerStart++;
            if (waitsServerStart < maxWaits) {
                setTimeout(
                    waitUntilServerIsReady.bind(null, callback),
                    waitDelay,
                );
            } else {
                callback(new Error("Server did not come up."));
            }
        }
    }

    function startClient() {
        clientProcess = spawn("node", ["test/apps/client"], {
            stdio: [0, "pipe", process.stderr],
        });
        clientProcess.stdout.on("data", (data) => {
            var str = data.toString();
            console.log("[client stdout]:", str);
            if (str.indexOf("RECEIVED: Anybody out there?") >= 0) {
                serverHasResponded = true;
            }
            if (str.indexOf("bye") >= 0) {
                serverHasSaidBye = true;
            }
        });
    }

    function waitUntilCommunicationHasHappened(callback) {
        if (serverHasResponded && serverHasSaidBye) {
            process.nextTick(function () {
                callback();
            });
        } else {
            waitsClient++;
            if (waitsClient < maxWaits) {
                setTimeout(
                    waitUntilCommunicationHasHappened.bind(null, callback),
                    waitDelay,
                );
            } else {
                callback(new Error("TCP communication did not happen."));
            }
        }
    }
});
