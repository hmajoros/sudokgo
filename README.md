sudokGO
=======
###How to run:
1. ```node server.js```
2. go to ```localhost:5000```
3. to have another user join, navigate to ```localhost:5000/?id=r_xxxxxxxxx```
    - check logs to find the right room id


###Important files:

__1. index.html__: contains the main view for the project. html / css

__2. server.js__: essentially the backend for the project

__3. client.js__: client side actions. emits and recieves messages to the server.

#How to send / recieve data
####1. User sends data (client.js)
```js
    socket.emit('custom_message', data);
```
####2. Server recieves, emits to everyone in room  (server.js)
```js
    socket.on('custom_message', function(data) {
        // send back to everyone
        // if we have rooms, only send to the proper room
        io.emit('custom_message', data);
    });
```
####3. All users recieve data (client.js again)
```js
    socket.on('custom_message', function(data) {
        // handle the data
    });
```
So the client sends a message, server processes it, and then sends it back to *ALL CLIENTS*
