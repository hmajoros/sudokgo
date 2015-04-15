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
    users = {},
    leaderboard = [];


// define object constructors
function User(roomID, socketID) {
    this.userID = generateUserID();
    this.roomID = roomID;
    this.socketID = socketID;
    this.ready = false;
}
 
function Room(roomID, hostID) {
    this.roomID = roomID;
    this.hostID = hostID;
    this.settings = new Settings();
    this.full = false;
    this.usersByID = [];
    this.startBoard = null;
    this.endBoard = null;
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

app.get('/leaderboard', function(req, res) {
    res.render('leaderboard_tpl', {
        title: 'Leaderboard',
        header: header_content
    });
});

io.on('connection', function(socket) {
    console.log('a user connected');

    // initialize user on join
    var user = new User(null, socket.id); 
    users[user.userID] = user; // add user to global list
    socket.uid = user.userID; // add socket var (MIGHT NOT BE NECESSARY)

    socket.on('create_room', function() {
        var roomID = generateRoomID();

        // create room
        rooms[roomID] = new Room(roomID, user.userID);
        rooms[roomID].usersByID.push(user.userID);

        // create board
        rooms[roomID].fillBoard();

        // initialize socket values
        socket.join(roomID);
        socket.room = roomID;
        user.roomID = roomID;

        socket.emit('room_created', roomID);
        console.log('room: ' + roomID + ' created!');
    });
    socket.on('join_room', function(roomID) {
        console.log("joining room");
        if (!rooms[roomID]) {
            console.log('room does not exist');
            socket.emit('incorrect_room');
            return;
        }

        if (rooms[roomID].full) {
            console.log('room is full');
            socket.emit('full_room');
            return;
        }

        rooms[roomID].full = true;
        rooms[roomID].usersByID.push(user.userID);

        // initialize socket values
        socket.join(roomID);
        socket.room = roomID;
        user.roomID = roomID;

        io.to(roomID).emit('game_ready');
        console.log('user joined room: ' + roomID);
    });

    socket.on('user_ready', function() {
        var user = users[socket.uid],
            room = rooms[user.roomID];

        user.ready = true;

        if (room.full && room.ready()) {
            console.log('starting game!');
            // room.fillBoard();

            // TODO: generate board, store it here.
            //      then send it to the room. Make sure
            //      you keep the solution stored here too
            io.to(room.roomID).emit('start_game', room.startBoard);
        }

    });

    socket.on('client_board_update', function(id, num) {
        var user = users[socket.uid],
            room = rooms[user.roomID];

        console.log(id, num);

        io.broadcast.to(room.roomID).emit('server_board_update', id, num);
    });

    socket.on('disconnect', function() {
        removeUser(socket.uid);
        socket.leave();

        console.log('a user left :(');
    });

    socket.on('print_stats', function() {
        console.log('==========================');
        console.log('rooms ')
        for (var r in rooms) {
            rooms[r].printRoom();
        }
    });

    socket.on('update_leaderboard', function(nameAndTime) {
        console.log('updating the leaderboard');
        console.log(nameAndTime);

        leaderboard.push(nameAndTime);
        for (var leader in leaderboard){
            console.log(leader);

        }
        socket.emit('leaderboard_updated', leaderboard);
    });

    socket.on('get_leaderboard', function() {
        socket.emit('sent_leaderboard', leaderboard);
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

function removeUser(uid) {
    var user = users[uid],
        room = rooms[user.roomID],
        cand; // candidate to remove

    // if user is not in a room, don't need to remove them from a room
    if (!room) return; 

    cand = room.usersByID.indexOf(uid);

    room.usersByID.splice(cand);
    delete users[uid];
    room.full = false; 

    if (room.usersByID.length === 0) {
        console.log('deleting room');
        delete rooms[room.roomID];
        return;
    }

    if (room.hostID == uid) {
        room.hostID = null;
        console.log('host left. need transfer');
        room.transferHost();
    }

    io.to(room.roomID).emit('restart_game');

    // TODO: emit message allowing host to invite new player.
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

/*******************************************************
 *
 *                  room prototypes
 *
 *******************************************************/

Room.prototype.transferHost = function() {
    // TODO: write this
};

Room.prototype.printRoom = function() {
    console.log('--------------------------');
    console.log('room ' + this.roomID);
    console.log(' | host: ' +  this.hostID);
    console.log(' | full: ' + this.full);
    console.log(' | users:');

    for (var i = 0; i < this.usersByID.length; i++) {
        users[this.usersByID[i]].printUser();
    }

    console.log('--------------------------');
};

Room.prototype.ready = function() {
    for (var i = 0; i < this.usersByID.length; i++) {
        if (!users[this.usersByID[i]].ready) return false;
    }
    return true;
};

Room.prototype.printBoard = function() {
    console.log("CURRENT BOARD (room: " + this.roomID);
    printBoard(this.endBoard);
};

Room.prototype.printStartBoard = function() {
    console.log("STARTING BOARD (room: " + this.roomID);
    printBoard(this.startBoard);
};

Room.prototype.fillBoard = function() {
    var board = new Array(81);
    var randomNine = fishYatesShuffle(9);
    //create base sudoku board
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            board[i * 9 + j] = (i * 3 + Math.floor(i / 3) + j) % 9 + 1;
        }
    }
    //switch corresponding cols (Ex. the 2nd and 5th column)
    for (var i = 0; i < 20; ++i) {
        var col = Math.floor(Math.random() * 3);
        do {
            var swap = col + (Math.floor(Math.random() * 3) * 3); // + 0, +3, +6
        } while (swap === 0)
        for (var j = 0; j < 9; ++j) {
            var tmp = board[col + (j * 9)];
            board[col + (j * 9)] = board[swap + (j*9)];
            board[swap + (j * 9)] = tmp;
        }
    }
    //switch cols within section blocks (Ex. all columns in the first three 
    //columns will be swapped)
    for (var i = 0; i < 20; ++i) {
        var block = Math.floor(Math.random() * 3);
        do {
            var swap1 = Math.floor(Math.random() * 3) + block * 3;
            var swap2 = Math.floor(Math.random() * 3) + block * 3;
        } while (swap1 === swap2)
        for (var j = 0; j < 9; ++j) {
            var tmp = board[swap1 + (j * 9)];
            board[swap1 + (j * 9)] = board[swap2 + (j * 9)];
            board[swap2 + (j * 9)] = tmp;
        }
    }
    //switch rows within section blocks (Ex. all rows in the first three rows will be swapped)
    for (var i = 0; i < 20; ++i) {
        var block = Math.floor(Math.random() * 3);
        do {
            var swap1 = Math.floor(Math.random() * 3) * 9 + block * 27;
            var swap2 = Math.floor(Math.random() * 3) * 9 + block * 27;
        } while (swap1 === swap2)
        for (var j = 0; j < 9; ++j) {
            var tmp = board[swap1 + j];
            board[swap1 + j] = board[swap2 + j];
            board[swap2 + j] = tmp;
        }
    }
    //switch numbers (Ex. all 9s will be swapped with all 7s on the board)
    for (var i = 0; i < 20; ++i) {
        do {
            var numb1 = Math.ceil(Math.random() * 9);
            var numb2 = Math.ceil(Math.random() * 9);
        } while (numb1 === numb2)
        for (var j = 0; j < board.length; ++j) {
            if (board[j] === numb1) board[j] = numb2;
            else if (board[j] === numb2) board[j] = numb1;
        }
    }
    this.endBoard = new Array(81);

    var temp = "";
    for (var i = 0; i < board.length; ++i)
    {
        this.endBoard[i] = board[i];
        temp += board[i];

        if ((i + 1) % 9 == 0) {
            console.log(temp);
            temp = "";
        }
    }

    this.printBoard();

    this.hideCells();
};

Room.prototype.hideCells = function() {
    var board = this.endBoard.slice(0),
        block = fishYatesShuffle(9);
    for (var i = 0; i < 9; ++i) {
        var cells = fishYatesShuffle(9),
            cur_block = block.pop(),
            block_row = Math.floor(cur_block / 3),
            block_col = cur_block - block_row * 3;

        for (var j = 0; j < 4; ++j) { 
            var cell = cells.pop(),
                row = Math.floor(cell / 3),
                col = cell - row * 3;
            cell = row * 9 + block_row * 27 + col + block_col * 3;
            board[cell] = 0;
            // --board_size;
        }
    }

    this.startBoard = board.slice(0);
    this.printStartBoard();
};

/*******************************************************
 *
 *                  user prototypes
 *
 *******************************************************/

 User.prototype.printUser = function() {
     console.log(' |   user ' + this.userID + ' (ready: ' + this.ready + ')');
 };

/*******************************************************
 *
 *                  sudoku functions
 *
 *******************************************************/

function printBoard(board) {
    if (board == null) {
        return;
    }

    var row = "| ";

    console.log('+---+---+---+---+---+---+---+---+---+');
    for (var i = 0; i < board.length; i++) {
        if (i % 9 == 0 && i > 0) {
            console.log(row);
            console.log('+---+---+---+---+---+---+---+---+---+');
            row = "| ";
        }

        row += board[i] + " | ";
    }

    console.log(row);
    console.log('+---+---+---+---+---+---+---+---+---+');
}

function fishYatesShuffle(size) {
    var fishYatesArray = [];
    for (var i = 0; i < size; i++) {
        fishYatesArray.push(i);
    }
    for (var j = size - 1; j >= 0; --j) {
        var k = Math.floor(Math.random() * (j+1));
        var cell1 = fishYatesArray[j];
        var cell2 = fishYatesArray[k];
        fishYatesArray[j] = cell2;
        fishYatesArray[k] = cell1;
    }
    return fishYatesArray;
}
