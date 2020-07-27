import { EchoSocket } from "./echo-socket";
import { NetLinkSocketBase } from "../../lib";

export type TestingSetup<
    T extends NetLinkSocketBase,
    S extends EchoSocket | undefined
> = {
    netLink: T;
    echo: S;
    host: string;
    port: number;
};

export type TestingSetupFunction<
    T extends NetLinkSocketBase,
    S extends EchoSocket | undefined
> = (suite: Mocha.Suite) => TestingSetup<T, S>;
