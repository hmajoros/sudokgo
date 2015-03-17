var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// define default settings
var BOARD_DIFFICULTY = 'EASY',
    SHOW_ERRORS = false,
    ALLOW_ERRORS = true;

// define global variables
var rooms = {},
    users = {};

// define object constructors
function User(username, roomID, socketID) {
    this.userID = generateUserID();
    this.username = username;
    this.roomID = roomID;
    this.socketID = socketID;
}
 
function Room(roomID, hostID) {
    this.roomID = roomID;
    this.hostID = hostID;
    this.settings = new Settings();
    this.full = false;
}

function Settings() {
    this.difficulty = BOARD_DIFFICULTY;
    this.showErrors = SHOW_ERRORS;
    this.allowErrors = ALLOW_ERRORS;
}

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('create_room', function(username) {
        var roomID = generateRoomID(),
            user = new User(username, roomID, socket.id);

        users[user.userID] = user;
        rooms[roomID] = new Room(roomID, user.userID);
        console.log('room: ' + roomID + ' created!');
        io.emit('room_created');
    });
    socket.on('join_room', function(username, roomID) {
        if (!rooms[roomID]) {
            console.log('room does not exist');
            io.emit('incorrect_room');
            return
        }

        if (rooms[roomID].full) {
            console.log('room is full');
            io.emit('full_room');
            return;
        }

        var user = new User(username, roomID, socket.id);

        users[user.userID] = user;
        rooms[roomID].full = true;
        console.log('user joined room: ' + roomID);
    });

    socket.on('msg', function(msg) {
        console.log('message: ' + msg);
        io.emit('msg', msg);
    });

    socket.on('disconnect', function() {
        console.log('a user left :(');
    });

});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

/*******************************************************
 *
 *                  utility functions
 *
 *******************************************************/

// generates a "unique" userID. should never duplicate
// found here: https://gist.github.com/gordonbrander/2230317
function generateUserID() {
  return 'u_' + Math.random().toString(36).substr(2, 9);
};

// roomID uses same generation algo as userID, but the
// difference between the two is the prefix, 'u_' or 'r_'
function generateRoomID() {
  return 'r_' + Math.random().toString(36).substr(2, 9);
};
