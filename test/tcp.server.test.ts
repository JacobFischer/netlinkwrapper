import { expect } from "chai";
import { badArg, TesterServerTCP } from "./utils";
import { NetLinkSocketClientTCP } from "../lib";

describe("TCP Server functionality", function () {
    const testing = new TesterServerTCP(this);

    it("exists", function () {
        expect(testing).to.exist;
    });

    it("can get hostFrom", function () {
        // "localhost" maps to ""
        expect(testing.netLink.hostFrom).to.equal("");
    });

    it("cannot set hostFrom", function () {
        expect(() => {
            testing.settableNetLink.hostFrom = badArg();
        }).to.throw();
    });

    it("can accept clients", function () {
        const client = testing.netLink.accept();

        expect(client).to.exist;
        expect(client).to.be.an.instanceOf(NetLinkSocketClientTCP);

        expect(client?.portFrom).to.equal(testing.port);

        client?.disconnect();
    });

    it("can send and receive data to the client", async function () {
        const client = testing.netLink.accept();

        expect(client).to.exist;
        if (!client) {
            throw new Error("client should exist");
        }

        const sentData = testing.echo.events.sentData.once();
        client.isBlocking = false;
        expect(client.receive()).to.be.undefined;
        client.send(testing.str);
        const sent = await sentData;
        expect(sent.str).to.equal(testing.str);
        const echoed = client.receive();
        expect(echoed?.toString()).to.equal(testing.str);

        client.disconnect();
    });

    it("can attempt to accept when no clients connect", function () {
        // We don't want it to block forever waiting for a client that
        // will never exist
        testing.netLink.isBlocking = false;

        // first echo client that always connects
        const client = testing.netLink.accept();
        expect(client).to.exist;

        // we never told anything else to connect, so expect nothing to accept
        const noClient = testing.netLink.accept();
        expect(noClient).to.be.undefined;

        client?.disconnect();
    });
});
