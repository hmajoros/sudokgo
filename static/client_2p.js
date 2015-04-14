(function() {

    // initialize main global for sockets
    var socket = io();

    $(document).ready(function() {

        checkURL();

        createSudoku();
    });


    function checkURL() {
        var roomID = getParameterByName('id');

        if (roomID) {
            socket.emit('join_room', roomID);
            $('#join').addClass('hide');
            $('#invite').addClass('hide');  
        }
    }

    // join a random game
    $('#join').click();
    

    // invite a friend
    $('#invite').click(function() {
        $(this).attr("disabled", "disabled");
        socket.emit('create_room');
    });

    $('#start').click(function() {
        $(this).attr("disabled", "disabled");
        socket.emit('user_ready');
    })

    socket.on('room_created', function(room) {
        //$('form').addClass('hide');
        $('.container:first').append('<div class="alert alert-danger">Now joined room ' + room + '. Invite your friends by sending them this link: ' + document.URL + '?id=' + room + '</div>');
    });

    socket.on('game_ready', function() {
        $('#join').addClass('hide');
        $('#invite').addClass('hide');
        $('#start').removeClass('hide');
    });

    socket.on('start_game', function() {
        $('#start').addClass('hide');
    })

    $('#printstats').click(function() {
        socket.emit('print_stats');
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
