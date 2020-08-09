import * as module from "../lib";
import { expect } from "chai";

describe("module", function () {
    it("has named exports", function () {
        expect(module.SocketBase).to.exist;
        expect(module.SocketClientTCP).to.exist;
        expect(module.SocketServerTCP).to.exist;
        expect(module.SocketUDP).to.exist;
    });

    it("cannot be constructed as a base class.", function () {
        expect(() => {
            new (module.SocketBase as {
                new (): module.SocketBase;
            })();
        }).to.throw();
    });
});
