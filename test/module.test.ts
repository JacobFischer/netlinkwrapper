import * as module from "../lib";
import { expect } from "chai";
import { expectType, TypeEqual } from "ts-expect";

const expectedNetLinkSocketBase = [
    "disconnect",
    "getHostTo",
    "getHostFrom",
    "getPortTo",
    "getPortFrom",
    "getSocketHandler",
    "isBlocking",
    "isClient",
    "isIPv4",
    "isIPv6",
    "isServer",
    "isTCP",
    "isUDP",
    "setBlocking",
] as const;

const expectedNetLinkSocketClientTCP = [
    ...expectedNetLinkSocketBase,
    "read",
    "write",
    "getNextReadSize",
] as const;

const expectedShapes = {
    [module.NetLinkSocketBase.name]: expectedNetLinkSocketBase,
    [module.NetLinkSocketClientTCP.name]: expectedNetLinkSocketClientTCP,
};

describe("module", function () {
    it("has named exports", function () {
        expect(module.NetLinkSocketBase).to.exist;
        expect(module.NetLinkSocketClientTCP).to.exist;
    });

    it("has types that match at runtime", function () {
        type ToUnion<T extends readonly unknown[]> = T[number];

        type BaseTestingFunctions = ToUnion<typeof expectedNetLinkSocketBase>;
        type BaseActualFunctions = keyof typeof module["NetLinkSocketBase"]["prototype"];
        // If "true" generates a TypeScript error, the two types do not share
        // the same keys.
        // This means we are not testing the entire TypeScript shape.
        expectType<TypeEqual<BaseTestingFunctions, BaseActualFunctions>>(true);

        type TCPClientTestingFunctions = ToUnion<
            typeof expectedNetLinkSocketClientTCP
        >;
        type TCPClientActualFunctions = keyof typeof module["NetLinkSocketClientTCP"]["prototype"];
        expectType<
            TypeEqual<TCPClientTestingFunctions, TCPClientActualFunctions>
        >(true);
    });

    describe("exports the correct shapes", function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        for (const [className, expectedShape] of Object.entries(
            expectedShapes,
        )) {
            it(`class ${className} has the correct shape`, function () {
                const classConstructor = (module as Record<string, unknown>)[
                    className
                ];
                expect(typeof classConstructor).to.equal("function");
                if (typeof classConstructor === "function") {
                    for (const expectedName of expectedShape) {
                        expect(
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            typeof classConstructor.prototype[expectedName],
                        ).to.equal("function");
                    }
                }
            });
        }
    });
});
