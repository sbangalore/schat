var http = require('http');
var fs = require('fs');
var express = require('express');
var path = require('path');

var app = express();
var server = http.createServer(app);
app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(server);

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res){
    res.render('index');
});

io.sockets.on('connection', function (socket, username) {
    // When the client connects, they are sent a message
    socket.emit('message', 'You are connected!');

    // As soon as the username is received, it's stored as a session variable
    socket.on('new_user', function(username) {
        socket.username = username;
    	// The other clients are told that someone new has arrived
    	console.log(username + ' has just connected.');
        socket.broadcast.emit('new_text', username + ' has just connected!');
        socket.emit('new_text', 'Welcome ' + username + '.');
    });

    // When a "message" is received, it's logged in the console
    socket.on('message', function (message) {
        // The username of the person who sent the message is retrieved from the session variables
        socket.broadcast.emit('new_text_user', socket.username);
        socket.broadcast.emit('new_text', message);
        // Then, if the person wrote the text, this will also be emitted
        socket.emit('self_text_user', socket.username);
        socket.emit('self_text', message);
    });

    // When a client is disconnected, let's other people know
    socket.on('disconnect', function(username) {
    	console.log(socket.username + ' has just disconnected.');
    	socket.broadcast.emit('new_text', socket.username + ' has just disconnected!');
    });
});

server.listen(8080);