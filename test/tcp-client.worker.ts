import { NetLinkSocketClientTCP } from "../lib";

const { testString, testPort } = process.env;

if (!testString || !testPort) {
    throw new Error("env not set properly for test worker!");
}

const netLink = new NetLinkSocketClientTCP("127.0.0.1", Number(testPort));
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
