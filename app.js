var http = require('http');
var fs = require('fs');

// Loading the file index.html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./public/index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket, username) {
    // When the client connects, they are sent a message
    socket.emit('message', 'You are connected!');

    // As soon as the username is received, it's stored as a session variable
    socket.on('new_user', function(username) {
        socket.username = username;
    	// The other clients are told that someone new has arrived
    	console.log(username + ' has just connected.')
        socket.broadcast.emit('new_text', username + ' has just connected!');
        socket.emit('new_text', 'welcome ' + username);
    });

    // When a "message" is received, it's logged in the console
    socket.on('message', function (message) {
        // The username of the person who sent the message is retrieved from the session variables
        socket.broadcast.emit('new_text', socket.username + ': ' + message);
        socket.emit('new_text', socket.username + ': ' + message)
    });

    // When a client is disconnected, let's other people know
    socket.on('disconnect', function(username) {
    	console.log(socket.username + ' has just disconnected.');
    	socket.broadcast.emit('new_text', socket.username + ' has just disconnected!');
    });
});


server.listen(8080);