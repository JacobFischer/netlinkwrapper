import { EchoServer } from "./echo-server";
import { NetLinkSocketBase } from "../../lib";

export type TestingSetup<T extends NetLinkSocketBase, S extends EchoServer> = {
    netLink: T;
    server: S;
    host: string;
    port: number;
};

export type TestingSetupFunction<
    T extends NetLinkSocketBase,
    S extends EchoServer
> = (suite: Mocha.Suite) => TestingSetup<T, S>;
