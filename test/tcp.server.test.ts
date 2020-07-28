import { expect } from "chai";
import { setupTestingForServerTCP } from "./utils";
import { NetLinkSocketClientTCP } from "../lib";

describe("TCP Server functionality", function () {
    const testing = setupTestingForServerTCP(this);

    it("exists", function () {
        expect(testing).to.exist;
    });

    it("can get hostFrom", function () {
        // "localhost" maps to ""
        expect(testing.netLink.getHostFrom()).to.equal("");
    });

    it("can accept clients", function () {
        const client = testing.netLink.accept();

        expect(client).to.exist;
        expect(client).to.be.an.instanceOf(NetLinkSocketClientTCP);

        expect(client?.getPortFrom()).to.equal(testing.echo.port);

        client?.disconnect();
    });

    it("can send and receive data to the client", async function () {
        const client = testing.netLink.accept();

        expect(client).to.exist;
        if (!client) {
            throw new Error("client should exist");
        }

        const testingString = "Hello dear client";
        const sentData = testing.echo.events.sentData.once();
        client.setBlocking(false);
        expect(client.receive()).to.be.undefined;
        client.send(testingString);
        const sent = await sentData;
        expect(sent.str).to.equal(testingString);
        const echoed = client.receive();
        console.log("echoed", echoed?.toString());
        expect(echoed?.toString()).to.equal(testingString);

        client.disconnect();
    });

    it("can attempt to accept when no clients connect", function () {
        // We don't want it to block forever waiting for a client that
        // will never exist
        testing.netLink.setBlocking(false);

        // first echo client that always connects
        const client = testing.netLink.accept();
        expect(client).to.exist;

        // we never told anything else to connect, so expect nothing to accept
        const noClient = testing.netLink.accept();
        expect(noClient).to.be.undefined;

        client?.disconnect();
    });
});
