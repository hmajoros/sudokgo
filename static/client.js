(function() {

    // initialize main global for sockets
    var socket = io();

    $('#username-form').submit(function() {
        var form = $('#username'),
            username = form.val(),
            roomID = getParameterByName('id');

        if (!roomID) {
            socket.emit('create_room', username);
        } else {
            socket.emit('join_room', username, roomID);
        }

        form.val('');
        form.blur();

        $('#row-msg').removeClass('hide');
        $('#row-username').addClass('hide');

        return false; // to prevent page reload
    });

    $('#chat-form').submit(function() {
        var form = $('#message'),
            msg = form.val();

        socket.emit('chat_message', msg);
        form.val('');

        $('#msg-cnt').append('<div class="col-xs-8 col-xs-offset-4 alert alert-info">' + msg + '</div>');
        return false;
    });

    $('#printstats').click(function() {
        socket.emit('print_stats');
    });

    socket.on('emit_message', function(msg, username) {
        $('#msg-cnt').append('<div class="col-xs-8 alert alert-success">' + msg + '</div><div class="clearfix"></div>');
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
