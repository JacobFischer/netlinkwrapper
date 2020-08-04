import { NetLinkSocketClientTCP, NetLinkSocketUDP } from "../lib";

const { testString, testPort, testType } = process.env;

if (!testString || !testPort || !testType) {
    throw new Error("env not set properly for test worker!");
}

const host = "127.0.0.1";
const port = Number(testPort);

const netLink =
    testType === "UDP"
        ? new NetLinkSocketUDP()
        : new NetLinkSocketClientTCP(port, host);

let echoedString: string | -1 = -1;
if (netLink instanceof NetLinkSocketClientTCP) {
    netLink.send(testString);
    const echoed = netLink.receive();
    echoedString = echoed?.toString() || -1;
} else {
    netLink.sendTo(host, port, testString);
    const echoedFrom = netLink.receiveFrom();
    if (echoedFrom?.port !== port) {
        throw new Error(`UDP Echo not from expected port '${port}'.`);
    }
    echoedString = echoedFrom.data.toString();
}

if (echoedString !== testString) {
    throw new Error(
        `Echo server failed! ("${testString}" !== "${echoedString}").`,
    );
}

netLink.disconnect();
// all looks good! process should exit with 0 here
