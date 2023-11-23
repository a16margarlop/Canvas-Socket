const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = [];
let drawings = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('setUsername', ({ username, userId, color }) => {
    socket.username = username;
    socket.userId = userId;
    users.push({ username, userId, x: 0, y: 0, path: [], color });
    io.emit('mousemove', users);

    socket.emit('drawing', drawings); // Enviar los dibujos existentes al nuevo usuario

    io.emit('userConnected', `${username} connected`);
  });

  socket.on('mousemove', ({ x, y, username, userId }) => {
    const userIndex = users.findIndex((user) => user.userId === userId);
    if (userIndex !== -1) {
        users[userIndex].x = x;
        users[userIndex].y = y;
    }

    io.emit('mousemove', users);
});

  socket.on('drawing', (data) => {
    drawings.push(data);
    io.emit('drawing', drawings);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      users = users.filter((user) => user.userId !== socket.userId);
      io.emit('mousemove', users);
      io.emit('userDisconnected', `${socket.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
