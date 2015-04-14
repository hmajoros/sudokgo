
//CREATE LEADERBOARD

        function createLeaderboard() {
            var leaderboardTable=document.getElementById('leaderboardTable');
            var boardbdy=document.createElement('tbody');

            leaderboardTable.style.border = "thick solid black";

            for(var i = 0; i < 10; ++i){
                var row=document.createElement('tr');
                for(var j = 0; j < 3; ++j){
                    var td=document.createElement('td');
                    if(j==0)
                    {
                        td.innerHTML = (i+1) + ".";
                        td.className += "numCell";
                    }
                    else if(j==1)
                    {
                        td.innerHTML = "";
                        td.className += "nameCell";
                    }
                    else
                    {
                        td.innerHTML = "";
                        td.className = "timeCell";
                    }
                    
                    td.style.border = "thin solid black";
                    row.appendChild(td)
                }
                boardbdy.appendChild(row);
            }
            leaderboardTable.appendChild(boardbdy);
        };

        function fillLeaderboard(leaderboard){
            console.log("blahhh", leaderboard);
            var count = 0;
            var names = document.getElementsByClassName("nameCell");
            var times = document.getElementsByClassName("timeCell");

            var leaderboardSortable = [];
           
            for (var name in leaderboard)
            {
                leaderboardSortable.push([name, leaderboard[name]]); 
                
                //Sort based on time
                leaderboardSortable.sort(function(a, b) 
                {
                    var amin = (a[1].split(":"))[0];
                    var asec = (a[1].split(":"))[1];
                    var bmin = (b[1].split(":"))[0];
                    var bsec = (b[1].split(":"))[1];
                    if(amin != bmin)
                        return amin - bmin
                    else
                        return asec - bsec
                })
            }

            //Only show top 10 
            for(var i=0; i<10; ++i)
            {
                names[count].innerHTML = leaderboardSortable[i][0];
                times[count].innerHTML = leaderboardSortable[i][1];
            }

        };

