/*By Laura Knutilla*/
//VALIDATION FUNCTIONS

//checks if entry is valid and changes color of cell and conflicts red depending on validity
    function checkValid(numb) {
        var valid = true;        
        var board = document.getElementsByClassName("cell");           
        if (checkConflict(numb, false)) {
            valid = false;
            document.getElementById(numb.id).style.color = "red";
            for (var i = 0; i < conflict_list.length; ++i)
            {
                var j = conflict_list[i];
                var comp = document.getElementById(board[j].id);
                comp.style.color = "red";
            }
        }
        if (valid && numb.innerHTML != "") {
            ++board_size;
        }
        checkBoard();
        return valid;
    };
//finds all conflicting cells returns true if conflict with cell exists  
//if checking against cell (!board_check), adds conflicts to a conflict_list
//if checking against board/current conflict list (board_check), doesn't add to conflict list
    function checkConflict(numb, board_check) { 
        var conflict = false;
        var board = document.getElementsByClassName("cell");
        var check = document.getElementById(numb.id);
        check = check.id.split("");
        for (var i = 0; i < board.length; ++i) {
            var boardId = board[i].id;
            boardId = boardId.split("");
            var row = boardId[0];
            var col = boardId[1];
            var block = boardId[2];
            if (row === check[0] && col === check[1]) continue;
            if (row === check[0] || col === check[1] || block === check[2]) {
                if (numb.innerHTML === board[i].innerHTML && numb.innerHTML != "") {
                    conflict = true;
                    //will add to conflict list unless reviewing conflict list
                    if (!board_check) conflict_list[conflict_list.length] = i;
                }
            }
        }
        return conflict;
    };
//removes and changes the color of all valid cells in conflict list
    function removeCorrectedConflicts() {
        if (conflict_list.length > 0)
        {
            var board = document.getElementsByClassName("cell");           
            for (var i = conflict_list.length-1; i >= 0; --i)
            {
                var j = conflict_list[i];
                var comp = document.getElementById(board[j].id);
                if (!checkConflict(comp, true)) {
                    conflict_list.splice(i,1);
                    comp.style.color = "black";
                }
            }
        }
    };
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
        console.log(name, time);
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




