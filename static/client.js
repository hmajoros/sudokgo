// initialize main global for sockets
var socket = io();

$('form').submit(function() {
    var username = $('#username').val();
    socket.emit('join_room', username);
    return false; // to prevent page reload
});

// socket.on('msg', function(msg) {
//     $('#messages').append($('<li>').text(msg));
// });

socket.on('join_success', function(room) {
    $('form').addClass('hide');
    $('.share-link div').text(room);
});
