sudokGO
=======

###Important files:

1. index.html
- contains the main view for the project. html / css

2. server.js
- essentially the backend for the project

3. client.js
- client side actions. emits and recieves messages to the server.

###How to send / recieve data
1. User sends data
- in client.js
```js
    socket.emit('custom_message', data);
```
- in server.js
```js
    socket.on('custom_message', function(data) {
        // do stuff here
        io.emit('custom_message', data);
    });
```
- then again in client.js
```js
    socket.on('custom_message', function(data) {
        // handle the data
    });
```
So the client sends a message, server processes it, and then sends it back to *ALL CLIENTS*
