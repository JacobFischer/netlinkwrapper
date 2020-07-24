import { EchoServer } from "./echo-server";
import { NetLinkSocketBase } from "../../lib";

export type TestingSetup = {
    netLink: NetLinkSocketBase;
    server: EchoServer;
    beforeEachTest: () => Promise<void>;
    afterEachTest: () => Promise<void>;
};

export type TestingSetupFunction = (
    host: string,
    port: number,
) => TestingSetup;
