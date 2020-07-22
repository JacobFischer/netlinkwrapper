import { port } from "./echo-server";
import { NetLinkSocketClientTCP } from "../src";

const { testString } = process.env;

if (!testString) {
    throw new Error("testString not set from env!");
}

const netLink = new NetLinkSocketClientTCP("127.0.0.1", port);
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
