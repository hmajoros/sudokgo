
    // initialize main global for sockets
    var socket = io();

    $(document).ready(function() {
        checkURL();

        $(document).on('keydown', updateBoard);

        var opts = {
          lines: 11, // The number of lines to draw
          length: 32, // The length of each line
          width: 7, // The line thickness
          radius: 60, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 19, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#000', // #rgb or #rrggbb or array of colors
          speed: 1.2, // Rounds per second
          trail: 64, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: '50%', // Top position relative to parent
          left: '50%' // Left position relative to parent
        };
        var spinner_div = document.getElementById('spinner');
        var spinner = new Spinner().spin();
        spinner_div.appendChild(spinner.el);
        // createSudoku();
        // createNumPad();
    });


    function checkURL() {
        var roomID = getParameterByName('id');

        if (roomID) {
            socket.emit('join_room', roomID);
            $('#join').addClass('hide');
            $('#invite').addClass('hide');  
        }
    }

    function updateBoard(event) {
        var b = new Array(81),
            cells = $('.cell');

        for (var i = 0; i < 81; i++) {
            b[i] = cells[i].innerHTML;
        }


    }

    // join a random game
    //$('#join').click();    

    // invite a friend
    $('#invite').click(function() {
        console.log("clicked");
        $(this).attr("disabled", "disabled");
        socket.emit('create_room');
        $("#spinner").removeClass("hide");
    });

    $('#start').click(function() {
        $(this).attr("disabled", "disabled");
        socket.emit('user_ready');
        $("#spinner").removeClass("hide");
    })

    socket.on('room_created', function(room) {
        //$('form').addClass('hide');
        $("#inviteModal .modal-body").html('Invite your friends by sending them this link: <div class="alert alert-info">' + document.URL + '?id=' + room + '</div>');
        $("#inviteModal").modal("show");
        $('.container:first').append('<div class="alert alert-danger">Now joined room ' + room + '. Invite your friends by sending them this link: ' + document.URL + '?id=' + room + '</div>');
    });

    socket.on('game_ready', function() {
        $("#spinner").addClass("hide");
        $('#invite').addClass('hide');
        $('#start').removeClass('hide'); //start game button appear
        $('.alert').remove();
    });

    socket.on('start_game', function(board) {
        //spinner stop
        $("#spinner").addClass("hide");
        $('#start').addClass('hide');
        for (var i = 0; i < board.length; i++) {
            var cell = $('.cell')[i];
            if (board[i]) {
                cell.innerHTML = board[i];
                $('#' + cell.id).addClass('cell-prefilled');
            }
        }
        startClock();
    });

    socket.on('insert_entry', function(id) {
        $('#' + id).addClass('opponent-solve');
    });

    socket.on('remove_entry', function(id) {
        // $('#' + id).css({ backgroundColor: 'white' });
        $('#' + id).removeClass('opponent-solve');
    });

    socket.on('game_loss', function() {
        stopClock();
        $("#finishModal .modal-title").html("Game Over");
        $("#finishModal .modal-body").html("You lost :(");
        $("#finishModal").modal("show");
    });

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

