# netlinkwrapper

This is a simple node-gyp module wrapper for the C++ library [netLink][netlink] v1.0.0_pre6. Meaning this is a very simple wrapper for a very simple TCP library. Also, and perhaps most importantly, this is a TCP implementation that only works synchronously, as opposed to Node's asynchronous paradigm.

## Purpose

Obviously node's net module is far more suited for TCP communications that this module. However, the net module can only work asynchronously, as is node's design. However if you are in the **very** rare situation where you need synchronous reading of sockets across platforms then this may suit you.

## How to use

As with most node modules, use npm to install it for you.

`npm install`

*Note*: [node-gyp][node-gyp] is a dependency.

### Requirements

As mentioned above, have [node-gyp][node-gyp] installed.

On Windows make sure you have the WIndows Build Tools installed (for ws2_32.lib). The most common way to attain these build tools is to just install [Visual Studio 2013][vs2013].

## Example

```javascript
var netlinkwrapper = require("netlinkwrapper");

var netlink = new netlinkwrapper();

netlink.connect("localhost", 3000);
netlink.blocking(false);

netlink.write("Am I people? Or am I dancer?");

while(true) {
    var str = netlink.read(1024);
    console.log("read: " + str);
}
```

## Docs

Docs can be found online at [GitHub][docs].

## Alternatives

If you are looking for similar functionality, but **without** the node-gyp dependency I have made a similar (but much slower) module, [SyncSocket][sync-socket].

## Why the old version, and why that library?

Because it was the easiest for me to get working and met my needs.

[netlink]: https://github.com/Lichtso/netLink
[node-gyp]: https://github.com/nodejs/node-gyp
[vs2013]: https://www.visualstudio.com/downloads/download-visual-studio-vs
[docs]: https://jacobfischer.github.io/netlinkwrapper/
[sync-socket]: https://github.com/JacobFischer/sync-socket
