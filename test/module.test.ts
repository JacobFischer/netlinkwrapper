import { NetLinkSocketBase, NetLinkSocketClientTCP } from "../src";
import { expect } from "chai";

describe("module", function () {
    it("named exports to exists", function () {
        expect(NetLinkSocketBase).to.exist;
        expect(NetLinkSocketClientTCP).to.exist;
    });

    it("exports a function", function () {
        expect(typeof NetLinkSocketBase).to.equal("function");
        expect(typeof NetLinkSocketClientTCP).to.equal("function");
    });

    describe("prototype shape", function () {
        for (const functionName of [
            "disconnect",
            "isBlocking",
            "read",
            "setBlocking",
            "write",
        ]) {
            it(`${functionName}() exists`, function () {
                const proto = (NetLinkSocketBase.prototype as unknown) as Record<
                    string,
                    unknown
                >;
                expect(typeof proto[functionName]).to.equal("function");
            });
        }
    });
});
