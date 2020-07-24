import { NetLinkSocketBase } from "../../lib";

export type TestingSetupFunction = (
    host: string,
    port: number,
) => {
    netLink: NetLinkSocketBase;
    beforeEachTest: () => Promise<void>;
    afterEachTest: () => Promise<void>;
};
