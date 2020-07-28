import { expect } from "chai";
import { setups } from "./utils";

const tcpSetups = [setups.tcpClient, setups.tcpServer];

describe("TCP shared functionality", function () {
    for (const { setup, isClient } of tcpSetups) {
        const testType = isClient ? "Client" : "Server";
        describe(`TCP ${testType}`, function () {
            const testing = setup(this);

            it("exists", function () {
                expect(testing.netLink).to.exist;
            });

            it("is TCP", function () {
                expect(testing.netLink.isTCP()).to.be.true;
            });

            it(`is a ${testType.toLowerCase()}`, function () {
                expect(testing.netLink.isClient()).to.equal(isClient);
                expect(testing.netLink.isServer()).to.equal(!isClient);
            });
        });
    }
});
