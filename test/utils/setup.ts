import { EchoServer } from "./echo-server";
import { NetLinkSocketBase } from "../../lib";

export type TestingSetup<T extends NetLinkSocketBase, S extends EchoServer> = {
    netLink: T;
    server: S;
    beforeEachTest: () => Promise<void>;
    afterEachTest: () => Promise<void>;
};

export type TestingSetupFunction<
    T extends NetLinkSocketBase,
    S extends EchoServer
> = (host: string, port: number) => TestingSetup<T, S>;
