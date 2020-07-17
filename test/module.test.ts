import defaultExport, { netLinkWrapper } from "../src";

describe("module", () => {
    it("exists", () => {
        expect(netLinkWrapper).toBeTruthy();
        expect(defaultExport).toBeTruthy();
    });

    it("is exported as named and default export", () => {
        expect(netLinkWrapper).toStrictEqual(defaultExport);
    });

    it("exports a function", () => {
        expect(typeof netLinkWrapper).toBe("function");
    });
});
