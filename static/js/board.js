/*By Laura Knutilla*/
//CREATE BOARD ELEMENTS

//BEGIN BLANK BOARD CREATION
/*createSudoku() creates a base board framework and is executed on page load*/
        var solved_board = [];
        var marked_board = [];
        var conflict_list = [];//list of currently conflicting/red board indexes
        var board_size = 81;

        function createSudoku() {
            var board=document.getElementById('sudokuTable');
            var boardbdy=document.createElement('tbody');

            board.style.border = "thick solid black";

            for(var i = 0; i < 9; ++i){
                var row=document.createElement('tr');
                for(var j = 0; j < 9; ++j){
                    marked_board[marked_board.length] = [];
                    var td=document.createElement('td');
                    td.innerHTML = "";
                    td.className += "cell";
                    td.style.border = "thin solid black";
                    var block;

                    if (i === 2 || i === 5) {
                        td.style.borderBottom = "thick solid black";
                    }
                    if (j === 2 || j === 5) { 
                        td.style.borderRight = "thick solid black";
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
                    td.id += numbID.join('');
                    td.onclick = function(event) { handleClick(this); };
                    row.appendChild(td)
                }
                boardbdy.appendChild(row);
            }
            board.appendChild(boardbdy);
        };
//END BLANK BOARD CREATION
//BEGIN NEW GAME CREATION
/*fillBoard() fills the board with a complete base sudoku board, it then scrambles the rows/cols/and numbers. 
It is executed on "New Game" press, and calls hideCells(). The algorithm is based on the sudoku generator by 
David J. Rager at http://blog.fourthwoods.com/2011/02/05/sudoku-in-javascript/     
*/  
        function fillBoard() {
            var board = document.getElementsByClassName("cell");
            var randomNine = fishYatesShuffle(9);
            //create base sudoku board
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    board[i * 9 + j].innerHTML = (i * 3 + Math.floor(i/3) + j) % 9 + 1;
                    board[i * 9 + j].style.color = "black";
                    board[i * 9 + j].style.backgroundColor = "#EBEBEB";
                }
            }
            //switch corresponding cols (Ex. the 2nd and 5th column)
            for (var i = 0; i < 20; ++i) {
                var col = Math.floor(Math.random() * 3);
                do {
                    var swap = col + (Math.floor(Math.random() * 3) * 3);// + 0, +3, +6
                }while(swap === 0)
                for (var j = 0; j < 9; ++j) {
                    var tmp = board[col + (j*9)].innerHTML;
                    board[col + (j*9)].innerHTML = board[swap + (j*9)].innerHTML;
                    board[swap + (j*9)].innerHTML = tmp;
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
                    var tmp = board[swap1 + (j*9)].innerHTML;
                    board[swap1 + (j*9)].innerHTML = board[swap2 + (j*9)].innerHTML;
                    board[swap2 + (j*9)].innerHTML = tmp;
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
                    var tmp = board[swap1 + j].innerHTML;
                    board[swap1 + j].innerHTML = board[swap2 + j].innerHTML;
                    board[swap2 + j].innerHTML = tmp;
                }
            }
            //switch numbers (Ex. all 9s will be swapped with all 7s on the board)
            for (var i = 0; i < 20; ++i) {
                do {
                    var numb1 = Math.ceil(Math.random() * 9);
                    var numb2 = Math.ceil(Math.random() * 9);
                }while(numb1 === numb2)
                for (var j = 0; j < board.length; ++j) {
                    if (board[j].innerHTML === numb1) board[j].innerHTML = numb2;
                    else if (board[j].innerHTML === numb2) board[j].innerHTML = numb1;
                }
            }
            for (var i = 0; i < board.length; ++i)
            {
                solved_board[i] = board[i].innerHTML;
            }

            hideCells();

         };
         function solveBoard() {
            //create base sudoku board
            var board = document.getElementsByClassName("cell");
            for (var i = 0; i < solved_board.length; i++) {
                board[i].innerHTML = solved_board[i];
                board[i].style.color = "black";
            }
            board_size = 81;
            checkBoard();
         };
         function clearBoard() {
            var board = document.getElementsByClassName("cell");
            for (var i = 0; i < board.length; i++) {
                board[i].innerHTML = "";
            }
            document.getElementById("timer").innerHTML = "00:00";
            board_size = 0;
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
                    board[cell].style.backgroundColor = "white";
                    board[cell].innerHTML = "";
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
//END NEW GAME CREATION
//BEGIN CREATE NUMPAD//
//createNumPad() creates a table(3x3) for iPad or screen use
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
                    if (count % 2 === 0) number.className += "btn btn-primary";
                    else number.className += "btn btn-info";
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

//END CREATE NUMPAD//
//CREATE MARK TABLE//
//createMarkTable() creates a table(3x3) and places it within the selected cell for marking
    function createMarkTable() {
        var td_table=document.createElement('table');
        var td_bdy=document.createElement('tbody');

        for(var i = 0; i < 3; ++i)
        {
            var row=document.createElement('tr');
            for(var j = 0; j < 3; ++j){
                var td=document.createElement('td');
                if ((i*3+j) < marked_board[index].length)
                {
                    td.innerHTML = marked_board[index][i*3+j];
                    td.style.fontSize = "x-small";
                    td.style.color = "black";
                }
                else 
                {td.innerHTML = "";}
                row.appendChild(td);
            }
            td_bdy.appendChild(row);
        }
        td_table.appendChild(td_bdy);
        td_table.style.display = "inline-block";

        edit_cell.appendChild(td_table);
    };       
//END CREATE MARK TABLE//
