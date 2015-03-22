var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var swig = require('swig');

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
    this.usersByID = [];
}

function Settings() {
    this.difficulty = BOARD_DIFFICULTY;
    this.showErrors = SHOW_ERRORS;
    this.allowErrors = ALLOW_ERRORS;
}

/*******************************************************
 *
 *                  begin everything
 *
 *******************************************************/

startListen();

app.use(express.static(path.join(__dirname, 'static')));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
    res.render('index', { title: 'Home' });
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('create_room', function(username) {
        var roomID = generateRoomID(),
            user = new User(username, roomID, socket.id);

        users[user.userID] = user;
        rooms[roomID] = new Room(roomID, user.userID);
        rooms[roomID].usersByID.push(user.userID);

        // initialize socket values
        socket.join(roomID);
        socket.room = roomID;
        socket.username = username;

        socket.emit('room_created', user.roomID);
        console.log('room: ' + roomID + ' created!');
    });
    socket.on('join_room', function(username, roomID) {
        if (!rooms[roomID]) {
            console.log('room does not exist');
            socket.emit('incorrect_room');
            return
        }

        if (rooms[roomID].full) {
            console.log('room is full');
            socket.emit('full_room');
            return;
        }

        for (var userID in rooms[roomID].usersByID) {
            if (username === users[userID]) {
                console.log('username exists. try another');
                socket.emit('username_taken'); // if we care about this
            }
        }

        var user = new User(username, roomID, socket.id);

        users[user.userID] = user;
        rooms[roomID].full = true;
        rooms[roomID].usersByID.push(user.userID);

        // initialize socket values
        socket.join(roomID);
        socket.room = roomID;
        socket.username = username;

        socket.emit('joined_room', user.roomID);
        console.log('user joined room: ' + roomID);
    });

    socket.on('chat_message', function(msg) {
        console.log('message: "' + msg + '" from user: ' + socket.username);
        socket.broadcast.to(socket.room).emit('emit_message', msg, socket.username);
    });

    socket.on('disconnect', function() {
        socket.leave()
        console.log('a user left :(');
    });

    socket.on('print_stats', function() {
        console.log('==========================');
        console.log('rooms ')
        for (var r in rooms) {
            room = rooms[r];
            console.log('  room ' + room.roomID);
            console.log('    host: ' + users[room.hostID].username + ' (id: ' +  room.hostID + ')');
            console.log('    full: ' + room.full);
            console.log('    users:');
            for (var u in room.usersByID) {
                user = users[room.usersByID[u]];
                console.log('      user ' + user.username + ' (id: ' + user.userID + ')');
            }
            console.log('--------------------------');
        }
    });

});


/*******************************************************
 *
 *                  utility functions
 *
 *******************************************************/

function startListen() {
    var port = Number(process.env.PORT || 5000);
    http.listen(port, function() {
        console.log('listening on *:' + port);
    });
}

// generates a "unique" userID. should never duplicate
// found here: https://gist.github.com/gordonbrander/2230317
function generateUserID() {
  return 'u_' + Math.random().toString(36).substr(2, 9);
}

// roomID uses same generation algo as userID, but the
// difference between the two is the prefix, 'u_' or 'r_'
function generateRoomID() {
  return 'r_' + Math.random().toString(36).substr(2, 9);
}
