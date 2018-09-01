'use strict';

var net = require('net');

var port = 3000;

var server = net.createServer(function(socket) {
  socket.on('data', function(data) {
    console.log('RECEIVED:', data.toString());
    socket.write(data);
    socket.write('bye');
    socket.end();
    setTimeout(function() {
      process.exit(0);
    }, 50);
  });
});

server.on('error', (err) => {
  throw err;
});

server.listen(port, () => {
  console.log('server is listening on port ' + port);
});

