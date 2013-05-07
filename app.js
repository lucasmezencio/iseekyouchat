var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    _ = require('underscore');

app.listen(8080);

// HOME
app.get('/', function (req, res) {
  res.sendfile(__dirname+'/index.html');
});

// HELP
app.get('/help', function (req, res) {
    res.sendfile(__dirname+'/help.html');
});

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {
    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', usernames[socket.username], data);
    });

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function (data) {
        // we store the username in the socket session for this client
        socket.username = data.username;
        // add the client's username to the global list
        usernames[data.username] = {
            username : data.username,
            color : data.color
        };
        // echo to client they've connected
        socket.emit('updatechat', 'SERVER', 'VOCÊ ESTÁ DENTRO!!');

        var message = '<span style="background-color:'+data.color+'">'+data.username+'</span> resolveu balangar beiço.';

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('updatechat', 'SERVER', message);
        // update the list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username+' pagou pau e pulou fora.');
    });
});