/*By Laura Knutilla*/
//TIMER FUNCTIONS

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
    };

    function stopWatch() {
        if (sec === 59) {
            ++min;
            sec = 0;
        }
        else sec++;
        document.getElementById("timer").innerHTML = convertToTime(min) + ":" + convertToTime(sec);
    };

    function convertToTime(time){
        if (time > 9) return time;
        else return "0"+time;
    };

    function restartClock() {
        clock = setInterval("stopWatch()", 1000);
        clicked = true;
    };

    function stopClock() {
        window.clearInterval(clock);
        document.getElementById("timer").innerHTML= convertToTime(min) + ":" + convertToTime(sec);
        clicked = false;
    };

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
    };

    $("#pause_play_btn").click(function(){
        if (is_board == true) $("#sudokuTable").toggle();
    });

    $("#new").click(function(){
        if (is_board == true) $("#sudokuTable").show();
    });                     

