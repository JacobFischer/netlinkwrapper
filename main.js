var netlinksocket = require('bindings')('netlinksocket');

var netlink = new netlinksocket.NetLinkWrapper();

netlink.connect("localhost", 3000);

netlink.send("Am I people? Or am I dancer?");

while(true) {
    var str = netlink.read(1024);
    console.log("reading... ", str);
}