/*By Laura Knutilla*/
//VALIDATION FUNCTIONS

var conflict_list = [];

function checkCell(cell) {
    // var board = document.getElementsByClassName("cell");
    var board = $('.cell'),
        cellID = $(cell)[0].id,
        rowCheck = cellID.substring(0, 1),
        colCheck = cellID.substring(1, 2),
        blockCheck = cellID.substring(2, 3);

    // var check = document.getElementById(cell.id);
    // check = check.id.split("");
    var valid = true;
    for (var i = 0; i < board.length; ++i) {
        var boardID = board[i].id,
            row = boardID.substring(0, 1),
            col = boardID.substring(1, 2),
            block = boardID.substring(2, 3);

        if (row === rowCheck && col === colCheck) continue;
        if (row === rowCheck || col === colCheck || block === blockCheck) {
            if (cell.innerHTML === board[i].innerHTML) {
                valid = false;
                //will add to conflict list unless reviewing conflict list
                $(cell).addClass('cell-conflict');
                $('#' + boardID).addClass('cell-conflict');
                // cell.style.color = "red";
                // board[i].style.color = "red";
                if (conflict_list.indexOf(cell.id) === -1) conflict_list[conflict_list.length] = cell.id;
                if (conflict_list.indexOf(board[i].id) === -1) conflict_list[conflict_list.length] = board[i].id;
            }
        }
    }
    return valid;
}

function removeConflicts() {
    var valid = false;
    for (var i = conflict_list.length-1; i >= 0; --i) {
        var cell = conflict_list[i];
        cell = document.getElementById(cell);
        if (checkCell(cell)) {
            $(cell).removeClass('cell-conflict');
            conflict_list.splice(i, 1);
        }
    }
}

//checks to see if the board is filled (all 81 cells are valid and filled)
    function checkBoard() {
        if (testing_board_size >= 81) {
            stopClock(); 
            var time = document.getElementById("timer").innerHTML;
            enableDelete = true;
            //IF they enter a name, add it to the leaderboard
            $("#finishModal .modal-body").html("You finished in " + time + ".");
            $("#finishModal").modal("show");
        } 
    };

    function showNewGameModal() {
        $("#startModal").modal("show");
    }

    function sendNameToLeaderboard() {
        var time = document.getElementById("timer").innerHTML;
        var name = document.getElementById("nameForLeaderboard").value;
        nameAndTime = [];
        nameAndTime[0] = name;
        nameAndTime[1] = time;
        enableDelete = false;

        //Take user to leaderboard 
        window.location.href = "/leaderboard";
        return nameAndTime;
    };

    function cancelNameForLeaderboard(){
        enableDelete = false;
        //Popup modal for new game
        showNewGameModal();

    };




