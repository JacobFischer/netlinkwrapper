import * as module from "../lib";
import { expect } from "chai";

describe("module", function () {
    it("has named exports", function () {
        expect(module.NetLinkSocketBase).to.exist;
        expect(module.NetLinkSocketClientTCP).to.exist;
        expect(module.NetLinkSocketServerTCP).to.exist;
        expect(module.NetLinkSocketUDP).to.exist;
    });
});
