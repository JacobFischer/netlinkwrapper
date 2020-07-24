import { NetLinkSocketClientTCP, NetLinkSocketClientUDP } from "../lib";

const { testString, testPort, testType } = process.env;

if (!testString || !testPort || !testType) {
    throw new Error("env not set properly for test worker!");
}

const NetLinkClientSocket =
    testType === "TCP" ? NetLinkSocketClientTCP : NetLinkSocketClientUDP;

const netLink = new NetLinkClientSocket("127.0.0.1", Number(testPort));
netLink.setBlocking(true);

netLink.write(testString);
const echoed = netLink.read(1024);
const echoedString = echoed ? echoed.toString() : "";
if (echoedString !== testString) {
    throw new Error(
        `Echo server failed! ("${testString}" !== "${echoedString}").`,
    );
}

netLink.disconnect();
// all looks good! process should exit with 0 here
