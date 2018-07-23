const net = require('net');

var server = net.createServer(function (socket) {
    socket.on('error', function(err) {
        console.error('SOCKET ERROR:', err);
    });
    socket.write('Echo server\n');
    socket.pipe(socket);
});

server.listen(1337, '127.0.0.1');
console.log('listening on 1337');
