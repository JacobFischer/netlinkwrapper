import { expect } from "chai";
import { setups } from "./utils";

const tcpSetups = [setups.tcpClient, setups.tcpServer];
const testType = (isClient: boolean) => (isClient ? "Client" : "Server");

describe("TCP shared functionality", function () {
    for (const { setup, isClient } of tcpSetups) {
        describe(`TCP ${testType(isClient)}`, function () {
            const testing = setup(this);

            it("exists", function () {
                expect(testing.netLink).to.exist;
            });

            it("is TCP", function () {
                expect(testing.netLink.isTCP()).to.be.true;
            });

            it(`is a ${testType(isClient).toLowerCase()}`, function () {
                expect(testing.netLink.isClient()).to.equal(isClient);
            });

            it(`is not a ${testType(!isClient).toLowerCase()}`, function () {
                expect(testing.netLink.isServer()).to.equal(!isClient);
            });
        });
    }
});
