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
    this.userID = ID();
    this.username = username;
    this.roomID = roomID;
    this.socketID = socketID;
}
 
function Room(roomID) {
    this.roomID = roomID;
    this.hostname = null;
    this.settings = new Settings();
}

function Settings() {
    this.difficulty = BOARD_DIFFICULTY;
    this.showErrors = SHOW_ERRORS;
    this.allowErrors = ALLOW_ERRORS;
}



app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
    if (req.query.id) roomID = req.query.id;
    console.log(roomID);
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('join_room', function(username) {
        // check if username is specific length ???
        if (!req.query.id) {
            // generate new room
        }
        var socketID = socket.id,
            user = new User(username, roomID, socketID);
        io.emit('join_success', user.roomID);
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


//
// start utility functions
//


// generates a "unique" userID. should never duplicate
// found here: https://gist.github.com/gordonbrander/2230317
function generateUserID() {
  return 'u_' + Math.random().toString(36).substr(2, 9);
};

function generateRoomID() {
  return 'r_' + Math.random().toString(36).substr(2, 9);
};
