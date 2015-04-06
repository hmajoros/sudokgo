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
            msg = form.val(),
            cnt = $('#msg-cnt'),
            scrollPos;

        socket.emit('chat_message', msg);
        form.val('');

        cnt.append('<div class="alert alert-info chat-you">' + msg + '</div><div class="clearfix"></div>');
        scrollPos = cnt[0].scrollHeight - cnt.height();
        cnt.animate({ scrollTop: scrollPos }, 100);
        return false;
    });

    $('#printstats').click(function() {
        socket.emit('print_stats');
    });

    socket.on('emit_message', function(msg, username) {
        var cnt = $('#msg-cnt'),
            scrollPos;
        
        cnt.append('<div class="alert alert-success chat-other">' + msg + '</div><div class="clearfix"></div>');
        scrollPos = cnt[0].scrollHeight - cnt.height();
        cnt.animate({ scrollTop: scrollPos }, 100);
    });


    
    // socket.on('msg', function(msg) {
    //     $('#messages').append($('<li>').text(msg));
    // });

    socket.on('room_created', function(room) {
        //$('form').addClass('hide');
        $('#msg-cnt').append('<div class="alert alert-danger">Now joined room ' + room + '. Invite your friends by sending them this link: ' + document.URL + '?id=' + room + '</div>');
        $('.share-link div').text(room);
    });


    /*****************************************************
    *
    *                   Utility functions
    *
    *****************************************************/
 
    // gets the roomID from the url parameter
    // taken from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? ""
               : decodeURIComponent(results[1].replace(/\+/g, " "));
    } 
     
})();
