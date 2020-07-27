import { NetLinkSocketClientTCP, NetLinkSocketUDP } from "../lib";

const { testString, testPort, testType } = process.env;

if (!testString || !testPort || !testType) {
    throw new Error("env not set properly for test worker!");
}

const NetLinkClientSocket =
    testType === "TCP" ? NetLinkSocketClientTCP : NetLinkSocketUDP;

const netLink = new NetLinkClientSocket("127.0.0.1", Number(testPort));
netLink.setBlocking(true);

netLink.send(testString);
const echoed = netLink.receive();
const echoedString = echoed?.toString() || -1;

if (echoedString !== testString) {
    throw new Error(
        `Echo server failed! ("${testString}" !== "${echoedString}").`,
    );
}

netLink.disconnect();
// all looks good! process should exit with 0 here
