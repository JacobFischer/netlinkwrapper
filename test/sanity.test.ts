describe("sanity tests", () => {
    it("knows true is true", () => {
        expect(typeof true).toEqual("boolean");
        expect(true).toEqual(true);
        expect(true).toStrictEqual(true);
        expect(true).toBeTruthy();
    });

    it("knows true is not false", () => {
        expect(true).toEqual(!false);
    });

    it("can compare numbers", () => {
        expect(1337).toBeLessThan(9000);
        expect(9000).toBeGreaterThan(1337);
    });
});
