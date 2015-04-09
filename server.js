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
function User(roomID, socketID) {
    this.userID = generateUserID();
    this.roomID = roomID;
    this.socketID = socketID;
}
 
function Room(roomID, hostID) {
    this.roomID = roomID;
    this.hostID = hostID;
    this.settings = new Settings();
    this.full = false;
    this.usersByID = [];
    // this.board // the solved board for the current game
}

function Settings() {
    this.difficulty = BOARD_DIFFICULTY;
    this.showErrors = SHOW_ERRORS;
    this.allowErrors = ALLOW_ERRORS;
}

//define templates
var layout_tpl = swig.compileFile('views/layout.html');
var header_tpl = swig.compileFile('views/header_tpl.html');
var single_player_tpl = swig.compileFile('views/single_player_tpl.html');

var header_content = header_tpl(
{
    //single_player = single_player_tpl
});
var layout = layout_tpl(
{
    header: header_content
});
/*
var single_player = single_player_tpl(
{
});*/

/*******************************************************
 *
 *                  begin everything
 *
 *******************************************************/

startListen();

// include all files stored in the static folder
app.use(express.static(path.join(__dirname, 'static')));

// initialize swig stuff
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

/*app.get('/', function(req, res) {
    res.render('index', { 
        title: 'Home',
        header: header_content 
    });
});*/
app.get('/', function(req, res) {
    res.render('single_player_tpl', { 
        title: 'Home',
        header: header_content 
    });
});

app.get('/multiplayer', function(req, res) {
    res.render('multi_player_tpl', {
        title: 'Multiplayer',
        header: header_content
    });
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('create_room', function() {
        var roomID = generateRoomID(),
            user = new User(roomID, socket.id);

        users[user.userID] = user;
        rooms[roomID] = new Room(roomID, user.userID);
        rooms[roomID].usersByID.push(user.userID);

        // initialize socket values
        socket.join(roomID);
        socket.room = roomID;

        socket.emit('room_created', user.roomID);
        console.log('room: ' + roomID + ' created!');
    });
    socket.on('join_room', function(roomID) {
        console.log("joining room");
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

        // for (var userID in rooms[roomID].usersByID) {
        //     if (username === users[userID]) {
        //         console.log('username exists. try another');
        //         socket.emit('username_taken'); // if we care about this
        //     }
        // }

        var user = new User(roomID, socket.id);

        users[user.userID] = user;
        rooms[roomID].full = true;
        rooms[roomID].usersByID.push(user.userID);

        // initialize socket values
        socket.join(roomID);
        socket.room = roomID;

        socket.emit('joined_room', user.roomID);
        console.log('user joined room: ' + roomID);
    });

    // socket.on('chat_message', function(msg) {
    //     console.log('message: "' + msg + '" from user: ' + socket.username);
    //     socket.broadcast.to(socket.room).emit('emit_message', msg, socket.username);
    // });

    socket.on('disconnect', function() {
        socket.leave();
        console.log('a user left :(');
    });

    socket.on('print_stats', function() {
        console.log('==========================');
        console.log('rooms ')
        for (var r in rooms) {
            room = rooms[r];
            console.log('  room ' + room.roomID);
            console.log('    host: ' +  room.hostID);
            console.log('    full: ' + room.full);
            console.log('    users:');
            for (var u in room.usersByID) {
                user = users[room.usersByID[u]];
                console.log('      user ' + user.userID);
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
