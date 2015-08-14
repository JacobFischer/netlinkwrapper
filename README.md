# netLinkWrapper

This is a simple node-gyp module wrapper for the C++ library [netLink](https://github.com/Lichtso/netLink) v1.0.0_pre6. Meaning this is a very simple wrapper for a very simple TCP library.

#### Why the old version, and why that library?

Because it was the easiest for me to get working and met my needs.

## Purpose

Obviously node's net module is far more suited for TCP communications that this module. However, the net module can only work asynchonously, as is node's design. However if you are in the **very** rare situation where you need synchronous reading of sockets across platforms then this may suit you.

## example

```javascript
var netlinksocket = require('bindings')('netlinksocket');

var netlink = new netlinksocket.NetLinkWrapper();

netlink.connect("localhost", 3000);

netlink.send("Am I people? Or am I dancer?");

while(true) {
    var str = netlink.read(1024);
    console.log("read: " + str);
}
```
