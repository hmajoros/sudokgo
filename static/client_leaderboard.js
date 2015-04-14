(function() {

    var socket = io();
    socket.emit('get_leaderboard'); 
    var clientLeaderboard = {};   

    socket.on('sent_leaderboard', function(leaderboard) {
        console.log("in the client, leaderboard is: ");
        console.log(leaderboard);
        clientLeaderboard = leaderboard;
        createLeaderboard();
        fillLeaderboard(clientLeaderboard);
    });

    

   
     
})();
