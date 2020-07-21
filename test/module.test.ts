import defaultExport, { netLinkWrapper } from "../src";
import { expect } from "chai";

describe("module", function () {
    it("named export 'netLinkWrapper' exists", function () {
        expect(netLinkWrapper).to.exist;
    });

    it("default export exists", function () {
        expect(defaultExport).to.exist;
    });

    it("named export and default export are the same", function () {
        expect(netLinkWrapper).to.equal(defaultExport);
    });

    it("exports a function", function () {
        expect(typeof netLinkWrapper).to.equal("function");
    });

    describe("prototype shape", function () {
        for (const functionName of [
            "disconnect",
            "getBlocking",
            "read",
            "setBlocking",
            "write",
        ]) {
            it(`${functionName}() exists`, function () {
                const proto = (netLinkWrapper.prototype as unknown) as Record<
                    string,
                    unknown
                >;
                expect(typeof proto[functionName]).to.equal("function");
            });
        }
    });
});
