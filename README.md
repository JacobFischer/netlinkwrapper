# netlinkwrapper

This is a simple node-gyp module wrapper for the C++ library [netLink]
v1.0.0_pre6. Meaning this is a very simple wrapper for a very simple TCP
library. Also, and perhaps most importantly, this is a TCP implementation
that only works synchronously, as opposed to Node's asynchronous paradigm.

## Purpose

Obviously node's net module is far more suited for TCP/UDP communications that
this module. However, the net module can only work asynchronously, as is
Node's design. However if you are in the **very** rare situation where you
need synchronous reading of sockets across platforms then this may suit you.

## How to use

As with most node modules, use npm to install it for you.

```
npm install netlinkwrapper
```

*Note*: [node-gyp] is a dependency.

### Requirements

As mentioned above, have [node-gyp] installed.

On Windows make sure you have the WIndows Build Tools installed
(for ws2_32.lib). The most common way to attain these build tools is to just
install [Visual Studio 2013].

## Examples

### TCP

```js
const { NetLinkSocketClientTCP, NetLinkSocketServerTCP } = require('netlinkwrapper');

const port = 33333;
const server = new NetLinkSocketServerTCP(port);
const client = new NetLinkSocketClientTCP('localhost', port);

const serverSends = 'hello world!';
const serversClient = server.accept();
serversClient.send(serverSends);

const clientReceived = client.receive();

const identical = serverSends ==== clientReceived.toString(); // should be true

console.log('the two strings are identical?', identical);
```

### UDP

```js
// TODO: do
```

## Docs

Docs can be found online at [GitHub][docs].

## Alternatives

If you are looking for similar functionality, but **without** the node-gyp
dependency I have made a similar (but **much** slower) module, [SyncSocket].

[netlink]: http://netlinksockets.sourceforge.net/
[node-gyp]: https://github.com/nodejs/node-gyp
[Visual Studio 2013]: https://www.visualstudio.com/downloads/download-visual-studio-vs
[docs]: https://jacobfischer.github.io/netlinkwrapper/
[SyncSocket]: https://github.com/JacobFischer/sync-socket
