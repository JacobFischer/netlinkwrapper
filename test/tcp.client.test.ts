/*
it("can connect and disconnect", async function () {
    const connectionPromise = server.events.newConnection.once();
    const preConnectionCount = await server.countConnections();
    expect(preConnectionCount).to.equal(0);

    const netLink = new NetLinkSocketClientTCP(localhost, port);
    const listener = await connectionPromise;
    expect(listener).to.be.instanceOf(Socket);

    // should now be the only connection
    const postConnectionCount = await server.countConnections();
    expect(postConnectionCount).to.equal(1);

    const disconnectPromise = server.events.closedConnection.once();
    netLink.disconnect();
    const disconnected = await disconnectPromise;
    expect(disconnected.from).to.equal(listener);
    expect(disconnected.hadError).to.be.false;
});
*/
