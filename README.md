# netlinkwrapper

NetLinkWrapper allows access to TCP and UDP sockets via **synchronous** calls
safety across platforms.

This is a simple node-gyp module wrapper for the C++ library
[NetLink Sockets][netlink]. Meaning this is a simple wrapper for a simple
TCP/UDP socket. Also, and perhaps most importantly, this is an
implementation that **only** works synchronously, as opposed to Node's
asynchronous paradigm.

## Purpose

Obviously node's [net]/[dgram] modules are far more suited for most TCP/UDP
communications than this module. However, those modules can only work
asynchronously, as is Node's design. To contrast, that is the opposite of the
intention of this module. If you are in the **very** odd situation where you
need synchronous usage of sockets across platforms, then this module may suit
you.

## How to use

As with most modules, use npm or your preferred package manager to install it
for you.

```
npm install netlinkwrapper
```

**Note** [node-gyp] is a dependency. Ensure your setup can build C++ modules.
Follow their documentation for installing the appropriate C++ build tools based
on your environment.

## Examples

### TCP

```js
const { SocketClientTCP, SocketServerTCP } = require('netlinkwrapper');

const port = 33333;
const server = new SocketServerTCP(port);
const client = new SocketClientTCP(port, 'localhost');

const serverSends = 'hello world!';
const serversClient = server.accept();
serversClient.send(serverSends);

const clientReceived = client.receive();

const identical = serverSends === clientReceived.toString(); // should be true

console.log('the two strings are identical?', identical);

client.disconnect();
server.disconnect();

```

### UDP

```js
const { SocketUDP } = require('netlinkwrapper');

const portA = 54321;
const portB = 12345;

const socketA = new SocketUDP(portA, 'localhost');
const socketB = new SocketUDP(portB, 'localhost');

socketA.sendTo('localhost', portB, 'Hello from socketA');
const got = socketB.receiveFrom();

const identical = got.port === portA;
console.log('identical?', identical); // should be: true

// should be: 'got: 'Hello from socketA' from localhost:54321'
console.log(`got: '${got.data.toString()}' from ${got.host}:${got.port}`);

socketA.disconnect();
socketB.disconnect();

```

## Other Notes

Due to the connection-less nature of UDP, the same constructor can be used
to make a "client" or "server" esc UDP socket.

After calling `disconnect` on a socket it is considered "destroyed", and cannot
be re-used. In addition, attempting to call any functions off it will result in
Errors being thrown.

TypeScript types are included in this package. They are highly encouraged to
use. Attempting to do anything outside the scope of the included types will
probably result in Errors being thrown.

## Docs

Official documentation can be found online at [GitHub][docs].

## Alternatives

If you are looking for similar functionality, but **without** the node-gyp
dependency I have made a similar (but **much** slower) module, [SyncSocket].

[netlink]: http://netlinksockets.sourceforge.net/
[net]: https://nodejs.org/api/net.html
[dragm]: https://nodejs.org/api/dgram.html
[node-gyp]: https://github.com/nodejs/node-gyp
[docs]: https://jacobfischer.github.io/netlinkwrapper/
[SyncSocket]: https://github.com/JacobFischer/sync-socket
