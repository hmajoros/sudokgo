/*By Laura Knutilla*/

/*Timer function begins time when "New Game" is pressed, and ends when "Done!" is pressed
and the board is valid. Based on code at http://jsfiddle.net/AbrGL/8/*/
//START TIMER SECTION
        var is_board = false;
        var clicked = false;
        var sec,min;
        
        function startClock() {  
            sec = 0;
            min = 0;
            is_board = true;    
            document.getElementById("pause_play_btn").disabled = false;
            if (clicked === false) {
                clock = setInterval("stopWatch()", 1000);
                clicked = true;
            }
        }

        function stopWatch() {
            if (sec === 59) {
                ++min;
                sec = 0;
            }
            else sec++;
            document.getElementById("timer").innerHTML = convertToTime(min) + ":" + convertToTime(sec);
        }

        function convertToTime(time){
            if (time > 9) return time;
            else return "0"+time;
        }

        function restartClock() {
            clock = setInterval("stopWatch()", 1000);
            clicked = true;
        }

        function stopClock() {
            window.clearInterval(clock);
            document.getElementById("timer").innerHTML= convertToTime(min) + ":" + convertToTime(sec);
            clicked = false;
        }
        function toggleClock() {
            var pause_play=document.getElementById('pause_play');

            if (clicked === true) //clock is running->pause
            {
                stopClock();
                pause_play.className = "glyphicon glyphicon-play";
            }
            else if (is_board === true)
            {
                restartClock();
                pause_play.className = "glyphicon glyphicon-pause";
            }
        }

        $("#pause_play_btn").click(function(){
            if (is_board == true) $("#sudokuTable").toggle();
        });

        $("#new").click(function(){
            if (is_board == true) $("#sudokuTable").show();
        });

                      

//END TIMER SECTION
//BEGIN CREATE NUMPAD//
        var current_cell;//current selected cell
        function createNumPad() {
            var num_pad=document.getElementById('numPad');
            var num_pad_bdy=document.createElement('tbody');
            var count = 1;
            for(var i = 0; i < 3; ++i){
                var row=document.createElement('tr');
                for(var j = 0; j < 3; ++j){
                    var td=document.createElement('td');
                    var number = document.createElement("button");
                    number.type = "button";
                    number.className += "btn btn-primary";
                    number.innerHTML = count;
                    number.value = count;
                    number.onclick = function(event) { handleNumPad(this); };

                    td.appendChild(number);
                    row.appendChild(td);
                    ++count;
                }
                num_pad_bdy.appendChild(row);
            }
            num_pad.appendChild(num_pad_bdy);
        };
        function handleNumPad(number) {
            var selected = document.getElementById(current_cell.id);
            selected.value = number.value;
            handleBlur(selected);
        };
//END CREATE NUMPAD//
/*createSudoku() creates a base board framework and is executed on page load*/
//BEGIN CREATE BOARD
        var solved_board = [];
        var conflict_list = []; //list of currently conflicting/red board indexes
        var board_size = 81;
        function createSudoku() {
            var board=document.getElementById('sudokuTable');
            var boardbdy=document.createElement('tbody');

            board.style.border = "thick solid black";

            for(var i = 0; i < 9; ++i){
                var row=document.createElement('tr');
                for(var j = 0; j < 9; ++j){
                    var td=document.createElement('td');
                    var numb = document.createElement("input");
                    numb.readOnly = true;
                    numb.className += "cell";
                    td.style.border = "thin solid black";
                    var block;

                    if (i === 2 || i === 5) {
                        td.style.borderBottom = "thick solid";
                    }
                    if (j === 2 || j === 5) {
                        td.style.borderRight = "thick solid";
                    }

                    if (i < 3 && j < 3) {
                        block = 'a';
                        //numb.className += "green_cell";
                    }
                    else if (i < 3 && j < 6) block = 'b';
                    else if (i < 3 && j > 5) {
                        block = 'c';
                        //numb.className += "green_cell";
                    }
                    else if (i < 6 && j < 3) block = 'd';
                    else if (i < 6 && j < 6) {
                        block = 'e';
                        //numb.className += "green_cell";
                    }
                    else if (i < 6 && j > 5) block = 'f';
                    else if (i > 5 && j < 3) {
                        block = 'g';
                        //numb.className += "green_cell";
                    }
                    else if (i > 5 && j < 6) block = 'h';
                    else {
                        block = 'i';
                        //numb.className += "green_cell";
                    }
                    numbID = [i, j, block];
                    numb.id += numbID.join('');
                    td.appendChild(numb);
                    row.appendChild(td)
                }
                boardbdy.appendChild(row);
            }
            board.appendChild(boardbdy);
        };
/*fillBoard() fills the board with a complete base sudoku board, it then scrambles the rows/cols/and numbers. 
It is executed on "New Game" press, and calls hideCells(). The algorithm is based on the sudoku generator by 
David J. Rager at http://blog.fourthwoods.com/2011/02/05/sudoku-in-javascript/     
*/
        function fillBoard() {
            solved_board = [];
            conflict_list = [];
            board_size = 81;

            var board = document.getElementsByClassName("cell");
            var randomNine = fishYatesShuffle(9);
            //create base sudoku board
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    board[i * 9 + j].value = (i * 3 + Math.floor(i/3) + j) % 9 + 1;
                    board[i * 9 + j].readOnly = true;
                    board[i * 9 + j].style.color = "black";
                }
            }
            //switch corresponding cols (Ex. the 2nd and 5th column)
            for (var i = 0; i < 20; ++i) {
                var col = Math.floor(Math.random() * 3);
                do {
                    var swap = col + (Math.floor(Math.random() * 3) * 3);// + 0, +3, +6
                }while(swap === 0)
                for (var j = 0; j < 9; ++j) {
                    var tmp = board[col + (j*9)].value;
                    board[col + (j*9)].value = board[swap + (j*9)].value;
                    board[swap + (j*9)].value = tmp;
                }
            }
            //switch cols within section blocks (Ex. all columns in the first three 
            //columns will be swapped)
            for (var i = 0; i < 20; ++i) {
                var block = Math.floor(Math.random() * 3);
                do {
                    var swap1 = Math.floor(Math.random() * 3) + block*3;
                    var swap2 = Math.floor(Math.random() * 3) + block*3;
                }while(swap1 === swap2)
                for (var j = 0; j < 9; ++j) {
                    var tmp = board[swap1 + (j*9)].value;
                    board[swap1 + (j*9)].value = board[swap2 + (j*9)].value;
                    board[swap2 + (j*9)].value = tmp;
                }
            }
            //switch rows within section blocks (Ex. all rows in the first three rows will be swapped)
            for (var i = 0; i < 20; ++i) {
                var block = Math.floor(Math.random() * 3);
                do {
                    var swap1 = Math.floor(Math.random() * 3) * 9 + block * 27;
                    var swap2 = Math.floor(Math.random() * 3) * 9 + block * 27;
                }while(swap1 === swap2)
                for (var j = 0; j < 9; ++j) {
                    var tmp = board[swap1 + j].value;
                    board[swap1 + j].value = board[swap2 + j].value;
                    board[swap2 + j].value = tmp;
                }
            }
            //switch numbers (Ex. all 9s will be swapped with all 7s on the board)
            for (var i = 0; i < 20; ++i) {
                do {
                    var numb1 = Math.ceil(Math.random() * 9);
                    var numb2 = Math.ceil(Math.random() * 9);
                }while(numb1 === numb2)
                for (var j = 0; j < board.length; ++j) {
                    if (board[j].value === numb1) board[j].value = numb2;
                    else if (board[j].value === numb2) board[j].value = numb1;
                }
            }
            for (var i = 0; i < board.length; ++i)
            {
                solved_board[i] = board[i].value;
            }

            hideCells();

         };
         function solveBoard() {
            //create base sudoku board
            var board = document.getElementsByClassName("cell");
            for (var i = 0; i < solved_board.length; i++) {
                board[i].value = solved_board[i];
                board[i].readOnly = true;
                board[i].style.color = "black";
            }
            board_size = 81;
            checkBoard();

         };
/*hideCells() naiivly hides 4 squares/block. This will create an easy sudoku puzzle that will normally be unique.*/
        function hideCells() {
            var board = document.getElementsByClassName("cell");
            var block = fishYatesShuffle(9);
            for (var i = 0; i < 9; ++i) {
                var cells = fishYatesShuffle(9);
                var cur_block = block.pop();
                var block_row = Math.floor(cur_block/3);
                var block_col = cur_block - block_row*3;
                for (var j = 0; j < 4; ++ j) { 
                    var cell = cells.pop();
                    var row = Math.floor(cell/3);
                    var col = cell - row*3;
                    cell = row*9 + block_row*27 + col + block_col*3;
                    board[cell].readOnly = false;
                    board[cell].style.color = "blue";
                    //board[cell].addEventListener("click", handleNumPad());
                    board[cell].onclick = function(event) { handleClick(this); };
                    board[cell].onblur = function(event) { handleBlur(this); };
                    board[cell].value = "";
                    --board_size;
                }
            }
        } 
/*fishYatesShuffle(size) implements the Fisher Yates algorithm to create a scrambled array of length "size".
Returns the scrambled array. */
        function fishYatesShuffle(size) {
            var fishYatesArray = [];
            for (var i = 0; i < size; i++) {
                fishYatesArray.push(i);
            }
            for (var j = size - 1; j >= 0; --j) {
                var k = Math.floor(Math.random() * (j+1));
                var cell1 = fishYatesArray[j];
                var cell2 = fishYatesArray[k];
                fishYatesArray[j] = cell2;
                fishYatesArray[k] = cell1;
            }
            return fishYatesArray;
        }
//END CREATE SUDOKU SECTION
//BEGIN VALIDATION SECTION
/*checkValid(numb) is called everytime a user clicks off of a filled cell entry. Checks to see if entry
matches other cells in the same block, column, or section. Returns bool: true if valid, false if not*/
        var old_val;//val of currently selected
        var new_val;//val of what the user changes the current value to
        function handleClick(numb) {
            current_cell = document.getElementById(numb.id);
            old_val = document.getElementById(numb.id).value;
        }
        function handleBlur(numb) {
            new_val = document.getElementById(numb.id).value;
            console.log("old " + old_val + "new" + new_val);
            if (new_val != old_val) //did the user change the value
            {
                removeCorrectedConflicts();
                if (checkValid(numb) && (numb.style.color === "red"))//if the user fixes a cell
                {
                    document.getElementById(numb.id).style.color = "blue";
                }
            }
            //need to handle if a user deletes a previously valid number (they know it's wrong before AI)  
        }
        //checks if cell is valid and turns it red if it is invalid
        function checkValid(numb) {
            var valid = true;        
            if(numb.value != "") {
                if (numb.value % 1 != 0 || numb.value > 9 || numb.value < 1) {
                    document.getElementById(numb.id).style.color = "red";
                    alert("Invalid Entry: Please enter a number between 1 - 9. You entered " + numb.value);
                    return false;
                }
            }
            else return true; //a blank space is valid
            var board = document.getElementsByClassName("cell");           
            if (checkConflict(numb, false)) {
                valid = false;
                document.getElementById(numb.id).style.color = "red";
                for (var i = 0; i < conflict_list.length; ++i)
                {
                    var j = conflict_list[i];
                    var comp = document.getElementById(board[j].id);
                    if (comp.readOnly === true) comp.style.color = "#990000";
                    else comp.style.color = "red";
                }
            }

            if (valid) {
                ++board_size;
                console.log(board_size);
            }
            checkBoard();
            return valid;
        };
        //finds conflicts with the number
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
                    if (numb.value === board[i].value && numb.value != "") {
                        conflict = true;
                        //will add to conflict list unless reviewing conflict list
                        if (!board_check) conflict_list[conflict_list.length] = i;

                    }
                }
            }
            return conflict;
        };

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
                        if (comp.readOnly === true) comp.style.color = "black";
                        else comp.style.color = "blue";
                    }
                    else console.log("still conflict");
                }
            }
        };
//checkBoard() checks the entire board to see if valid and stops the timer if it the valid
        function checkBoard() {
            if (board_size >= 81) {
                console.log("CONGRATS");
               alert("CONGRATS! " + "You finished in: " + convertToTime(min) + ":" + convertToTime(sec));
               stopClock(); 
            } 
        }
//END VALIDATION SECTION

