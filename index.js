const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Keep a simple in-memory user map (socket.id -> username)
const users = new Map();

io.on('connection', (socket) => {
    console.log('user connected', socket.id);

    // When a client sets its username
    socket.on('set username', (username, ack) => {
        users.set(socket.id, username);
        socket.broadcast.emit('system message', `${username} joined the chat`);
    });

    // When a client sends a chat message
    socket.on('chat message', (msg, ack) => {
        const name = users.get(socket.id) || 'Anonymous';
        const payload = { id: socket.id, name, msg, ts: Date.now() };
        io.emit('chat message', payload);
    });

    socket.on('disconnect', (reason) => {
        const name = users.get(socket.id);
        if (name) {
            users.delete(socket.id);
            socket.broadcast.emit('system message', `${name} left the chat`);
        }
    });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
