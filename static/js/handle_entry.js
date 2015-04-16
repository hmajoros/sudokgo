//HANDLE ENTRY TYPES
    var old_val;//val of currently selected
    var new_val;//val of what the user changes the current value to
    var edit_cell;//current editable selected cell
    var nonedit_cell;//currently uneditable selected cell
    var index;//index of current cell in board;
    var enter_num = true;//bool of whether number(init) or mark
    var enableDelete = false;

    var activeCell; // current selected cell

//listens for key stroke, removes delete functionality as "back", 
//and sends key hit to be handled (handleKey(key))
    $(document).bind("keydown", function(e){
        var key = String.fromCharCode(e.keyCode);

        if (e.which == 8 && enableDelete == false) { // 8 == backspace
            e.preventDefault();
            key = "";
            handleKey(key);
            return;
        } else if (e.keyCode >= 37 && e.keyCode <= 40) {
            e.preventDefault(); 
            handleArrow(e.keyCode);
        } else if (key > 0 && key < 10) {
            handleKey(key);
        }
    });

    function handleArrow(code) {
        if (!activeCell) return; // can't move if there isn't a currently selected cell

        var cellID = $(activeCell)[0].id,
            row = cellID.substring(0, 1),
            col = cellID.substring(1, 2),
            block = cellID.substring(2, 3),
            newID, newCell;

        // update position
        if (code === 37 && col != 0) --col;
        if (code === 38 && row != 0) --row;
        if (code === 39 && col != 8) ++col;
        if (code === 40 && row != 8) ++row;

        // update block (if needed)
        if (row < 3 && col < 3) block = 'a';
        else if (row < 3 && col < 6) block = 'b';
        else if (row < 3 && col > 5) block = 'c';
        else if (row < 6 && col < 3) block = 'd';
        else if (row < 6 && col < 6) block = 'e';
        else if (row < 6 && col > 5) block = 'f';
        else if (row > 5 && col < 3) block = 'g';
        else if (row > 5 && col < 6) block = 'h';
        else block = 'i';

        newID = [row, col, block].join('');
        newCell = $('#' + newID)[0];

        handleClick(newCell);
    };
    
//checks for valid 1-9 entry and either add num/mark depending on user setting
//then validates cell
    function handleKey(key) {
        if (!activeCell) return; // no cell currently selected
        if ($(activeCell).hasClass('cell-prefilled')) return; // cannot edit

        var oldVal = $(activeCell)[0].innerHTML;

        // TODO: Do we need this? only need it for marks maybe???
        while ($(activeCell)[0].hasChildNodes()) {
            $(activeCell)[0].removeChild($(activeCell)[0].firstChild);
        }

        if (enter_num) {
            if (socket != null) socket.emit('client_board_update', activeCell.id, key);
            if (key != oldVal) {
                changeCell(activeCell, key, oldVal);
                var undoInfo = [3];
                undoInfo[0] = activeCell;
                undoInfo[1] = oldVal;
                undoInfo[2] = key;
                undoStack.push(undoInfo);
            }

        } else { // marks
            if (key === "") {
                marked_board[index] = [];
            } else {
                var val_idx = marked_board[index].indexOf(key);
                if (val_idx === -1) marked_board[index].push(key);
                else marked_board[index].splice(val_idx,1);
            }

            createMarkTable();
            removeConflicts();

            // For undo
            var undoInfo = [3];
            undoInfo[0] = activeCell;
            undoInfo[1] = oldVal;
            undoInfo[2] = key;
            undoStack.push(undoInfo);
        }

        testing_board_size = updateBoardSize();
        checkBoard();
        console.log(testing_board_size);
    };

//formats selected cell and reports index, current cell val
    function handleClick(numb) {
        if (!numb) return; // nothing here

        $(activeCell).removeClass('cell-active');
        $(numb).addClass('cell-active');
        activeCell = numb;

        findIndex(activeCell.id);
    };
//handles numbers entered in num pad
    function handleNumPad(number) {
        if (!activeCell) return;
        handleKey(number.value);
    };
//finds index of cell by it's id
    function findIndex(id) {
        var row = parseInt(id.substring(0, 1), 10),
            col = parseInt(id.substring(1, 2), 10);
        index = (row * 9) + col;
    };
    function markSwitch(btn) {
        if (btn.id === "mark") {
            enter_num = false;
            $("#mark").removeClass("btn-default");
            $("#mark").addClass("btn-primary");
            $("#number").removeClass("btn-primary");
            $("#number").addClass("btn-default");
        }
        else {
            enter_num = true;
            $("#number").removeClass("btn-default");
            $("#number").addClass("btn-primary");
            $("#mark").removeClass("btn-primary");
            $("#mark").addClass("btn-default");
        }
    }; 

    function updateBoardSize() {
        var board = document.getElementsByClassName("cell");
        testingBoardSize = 0;
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                //and isn't a mark
                var num = board[i * 9 + j].innerHTML;
                if (num > 0 && num < 10) {
                    testingBoardSize++;
                }
            }
        }
        return testingBoardSize;
    }
//END ENTRY HANDLE

//BEGIN UNDOREDO SECTION
    function undo() {
        //TODO: disable when undoStack's length is 0
        if(undoStack.length > 0)
        {
            var info = undoStack.pop();
            changeCell(info[0], info[1], info[2]);
            redoStack.push(info);
        }
        
    }
    function redo() {
        //TODO: disable when redoStack's length is 0
        if(redoStack.length > 0)
        {
            var info = redoStack.pop();
            changeCell(info[0], info[2], info[1]);
            undoStack.push(info);
        }            
    }
    function changeCell(cell, new_value, old_value)
    {
        if(new_value == undefined)
                cell.innerHTML = null; // TODO: will this ever trigger?
        else
            cell.innerHTML = new_value;

        checkCell(cell);
        removeConflicts();
        testing_board_size = updateBoardSize();
        checkBoard();
        console.log(testing_board_size);
    }


