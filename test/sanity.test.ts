import { expect } from "chai";

describe("sanity tests", function () {
    it("knows true is true", function () {
        expect(typeof true).to.equal("boolean");
        expect(true).to.equal(true);
        expect(true).to.equal(true);
        expect(true).to.be.true;
    });

    it("knows true is not false", function () {
        expect(true).to.equal(!false);
    });

    it("can compare numbers", function () {
        expect(1337).to.be.lessThan(9000);
        expect(9000).to.be.greaterThan(1337);
    });
});
