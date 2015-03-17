(function() {

    // initialize main global for sockets
    var socket = io();

    $('#username-form').submit(function() {
        var username = $('#username').val(),
            roomID = getParameterByName('id');

        if (!roomID) {
            socket.emit('create_room', username);
        } else {
            socket.emit('join_room', username, roomID);
        }
        return false; // to prevent page reload
    });


    
    // socket.on('msg', function(msg) {
    //     $('#messages').append($('<li>').text(msg));
    // });

    socket.on('join_success', function(room) {
        $('form').addClass('hide');
        $('.share-link div').text(room);
    });


    /*****************************************************
    *
    *                   Utility functions
    *
    *****************************************************/
 
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? ""
               : decodeURIComponent(results[1].replace(/\+/g, " "));
    } 
     
})();
