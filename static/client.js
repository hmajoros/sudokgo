// initialize main global for sockets
var socket = io();

$('form').submit(function() {
    socket.emit('msg', $('#m').val());
    $('#m').val('');
    return false;
});
