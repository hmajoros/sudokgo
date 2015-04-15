//HANDLE ENTRY TYPES
    var old_val;//val of currently selected
    var new_val;//val of what the user changes the current value to
    var edit_cell;//current editable selected cell
    var nonedit_cell;//currently uneditable selected cell
    var index;//index of current cell in board;
    var enter_num = true;//bool of whether number(init) or mark
    var enableDelete = false;

//listens for key stroke, removes delete functionality as "back", 
//and sends key hit to be handled (handleKey(key))
    $(document).bind("keydown", function(e){
        var key;
        if( e.which == 8 && enableDelete == false){ // 8 == backspace
            e.preventDefault();
            key = "";
            handleKey(key);
            return;
        }
        if (e.keyCode >= 37 && e.keyCode <= 40) {
            e.preventDefault(); 
            handleArrow(e.keyCode);
        }
        key = String.fromCharCode(e.keyCode);
        handleKey(key);
    });

    function handleArrow(code) {
        var split_id = undefined;
        if (edit_cell != undefined) {
            split_id = edit_cell.id.split("");
        }
        if (nonedit_cell != undefined) { //will overrule edit_cell
            split_id = nonedit_cell.id.split("");
        }
        if (split_id != undefined) {
            var row = parseInt(split_id[0]);
            var col = parseInt(split_id[1]);
            var block;
            if (code === 37) --col;
            if (code === 38) --row;
            if (code === 39) ++col;
            if (code === 40) ++row;

            if (row < 3 && col < 3) block = 'a';
            else if (row < 3 && col < 6) block = 'b';
            else if (row < 3 && col > 5) block = 'c';
            else if (row < 6 && col < 3) block = 'd';
            else if (row < 6 && col < 6) block = 'e';
            else if (row < 6 && col > 5) block = 'f';
            else if (row > 5 && col < 3) block = 'g';
            else if (row > 5 && col < 6) block = 'h';
            else block = 'i';

            var numbID = [row, col, block];
            var new_id = numbID.join('');
            var new_cell = document.getElementById(new_id); 
            if (new_cell.style.backgroundColor === "white") handleClick(new_cell);
            else handleNav(new_cell);   
        }
    };
//checks for valid 1-9 entry and either add num/mark depending on user setting
//then validates cell
    function handleKey(key) {
        if (key != "") {
            if (key % 1 != 0 || key > 9 || key < 1) {
                return;
            }
        }
        if (edit_cell != undefined) {

            new_val = key;
            old_val = edit_cell.innerHTML;
            
            if (new_val === "" & old_val != "" && edit_cell.style.color === "black") --board_size;
            
            //For undo/redo marks
            var old_val_undo = edit_cell.innerHTML;

            while (edit_cell.hasChildNodes()) {
                edit_cell.removeChild(edit_cell.firstChild);
            }
            if (enter_num)//enter number
            {
                edit_cell.innerHTML = new_val;
                if (new_val != old_val) //did the user change the value
                {
                    removeCorrectedConflicts();
                    if (checkValid(edit_cell))//if the user fixes a cell
                    {
                        if (edit_cell.style.color === "red") edit_cell.style.color = "black";
                    }
                    var undoInfo = [3];
                    undoInfo[0] = edit_cell;
                    undoInfo[1] = old_val_undo;
                    undoInfo[2] = new_val;
                    undoStack.push(undoInfo);
                }
            }
            else //enter mark
            {                      
                if (new_val === "" && marked_board[index].length > 0) marked_board[index].pop();
                else
                {
                    var val_idx = marked_board[index].indexOf(new_val);
                    if (val_idx === -1) marked_board[index].push(new_val);
                    else marked_board[index].splice(val_idx,1);
                }
                createMarkTable();
                removeCorrectedConflicts();

                //For undo
                var undoInfo = [3];
                undoInfo[0] = edit_cell;
                undoInfo[1] = old_val_undo;
                undoInfo[2] = edit_cell.innerHTML;
                undoStack.push(undoInfo);
            }
        }
        console.log(board_size);
    };
//formats selected cell and reports index, current cell val
    function handleClick(numb) {
        if (edit_cell != undefined) edit_cell.style.backgroundColor = "white";
        if (nonedit_cell != undefined) {
            nonedit_cell.style.backgroundColor = "#EBEBEB";
            nonedit_cell = undefined;
        }
        findIndex(numb.id);
        console.log(numb.style.backgroundColor);
        if (numb.style.backgroundColor === "rgb(235, 235, 235)") {
            console.log("non-edit");
            handleNav(numb);
        }
        else {
            console.log("edit");
            edit_cell = document.getElementById(numb.id);
            old_val = document.getElementById(numb.id).innerHTML;
            edit_cell.style.backgroundColor = "#CFF6FF";
            removeCorrectedConflicts();
        }
    };
//handles arrow nav to rule spots
    function handleNav(numb) {
        if (edit_cell != undefined) {
            edit_cell.style.backgroundColor = "white";
            edit_cell = undefined;
        }
        if (nonedit_cell != undefined) nonedit_cell.style.backgroundColor = "#EBEBEB";
        nonedit_cell = numb;
        nonedit_cell.style.backgroundColor = "#B5B5B5";
    };
//handles numbers entered in num pad
    function handleNumPad(number) {
        if (edit_cell === undefined) return;
        var selected = document.getElementById(edit_cell.id);
        old_val = selected.value;
        if (old_val === number.value) selected.value = "";
        else selected.value = number.value;
        handleKey(selected.value);
    };
//finds index of cell by it's id
    function findIndex(id) {
        var split_id = id.split("");
        index = parseInt(split_id[0]) * 9 + parseInt(split_id[1]);
    };
    function markSwitch() {
        var note_inner = document.getElementById("note_entry").innerHTML;
        if (note_inner === "NUM") {
            enter_num = true;//number entries
            document.getElementById("note_entry").innerHTML = "MARK";
        }
        else {
            enter_num = false;//mark entries
            document.getElementById("note_entry").innerHTML = "NUM";
        }
    }; 
//END ENTRY HANDLE

//BEGIN UNDOREDO SECTION
    function undo() {
        //TODO: disable when undoStack's length is 0
        if(undoStack.length > 0)
        {
            var info = undoStack.pop();
            changeCell(info[0],info[1], info[2]);
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
        var oldColor = cell.style.color;
        if(new_value == undefined)
                cell.innerHTML = null;
        else
            cell.innerHTML = new_value;
        removeCorrectedConflicts();
        if (checkValid(cell))//if the user fixes a cell
        {
            if (cell.style.color === "red") cell.style.color = "black";
        }
        else if (new_value === "" && old_value != "" && cell.style.color === "black") 
        {
            if(!(new_value == "" && oldColor == "red"))
            {
                --board_size;
            }
        }
        console.log(board_size);
    }


