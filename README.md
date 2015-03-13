sudokGO
=======

###Important files:

####1. index.html

- contains the main view for the project. html / css

####2. server.js

- essentially the backend for the project

####3. client.js

- client side actions. emits and recieves messages to the server.

###How to send / recieve data
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
