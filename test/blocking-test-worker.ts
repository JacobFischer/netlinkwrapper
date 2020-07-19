import { port } from "./echo-server";
import netLinkSocket from "../src";

const { testString } = process.env;

if (!testString) {
    throw new Error("testString not set from env!");
}

const netLink = new netLinkSocket();

netLink.connect(port);
netLink.blocking(true);

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
