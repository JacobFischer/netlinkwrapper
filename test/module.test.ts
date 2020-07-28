import * as module from "../lib";
import { expect } from "chai";
import { expectType, TypeEqual } from "ts-expect";

const expectedNetLinkSocketBase = [
    "disconnect",
    "getPortFrom",
    "isBlocking",
    "isDestroyed",
    "isIPv4",
    "isIPv6",
    "isTCP",
    "isUDP",
    "setBlocking",
] as const;

const expectedNetLinkSocketClientTCP = [
    ...expectedNetLinkSocketBase,
    "getPortTo",
    "getHostTo",
    "receive",
    "send",
    "isClient",
    "isServer",
] as const;

const expectedNetLinkSocketServerTCP = [
    ...expectedNetLinkSocketBase,
    "accept",
    "getHostFrom",
    "isClient",
    "isServer",
] as const;

const expectedNetLinkSocketUDP = [
    ...expectedNetLinkSocketBase,
    "getPortTo",
    "getHostFrom",
    "getHostTo",
    "receive",
    "receiveFrom",
    "send",
    "sendTo",
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

        type TCPServerTestingFunctions = ToUnion<
            typeof expectedNetLinkSocketServerTCP
        >;
        type TCPServerActualFunctions = keyof typeof module["NetLinkSocketServerTCP"]["prototype"];
        expectType<
            TypeEqual<TCPServerTestingFunctions, TCPServerActualFunctions>
        >(true);

        type UDPTestingFunctions = ToUnion<typeof expectedNetLinkSocketUDP>;
        type UDPActualFunctions = keyof typeof module["NetLinkSocketUDP"]["prototype"];
        expectType<TypeEqual<UDPTestingFunctions, UDPActualFunctions>>(true);
    });

    describe("exports the correct shapes", function () {
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
