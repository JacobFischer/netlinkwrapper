'use strict';

var netlinkwrapper = require('../..');
var netlink = new netlinkwrapper();

netlink.connect(3000, 'localhost');
netlink.blocking(false);

netlink.write('Anybody out there?');

var keepReading = true;
while (keepReading) {
  var str = netlink.read(1024);
  if (str) {
    console.log('RECEIVED:', str);
    if (str.indexOf('bye') >= 0) {
      keepReading = false;
    }
  }
}

