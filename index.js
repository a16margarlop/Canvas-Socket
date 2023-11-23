const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


let users = []; // Almacenar la información de cada usuario

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('setUsername', ({ username, userId }) => {
    // Asignar nombre y ID al socket
    socket.username = username;
    socket.userId = userId;

    // Agregar usuario a la lista
    users.push({ username, userId, x: 0, y: 0 }); // Inicialmente en la posición (0, 0)

    // Emitir la lista actualizada de usuarios a todos los clientes
    io.emit('mousemove', users);

    io.emit('userConnected', `${username} connected`);
  });

  socket.on('mousemove', ({ x, y, username, userId }) => {
    // Actualizar la posición del usuario en la lista
    const userIndex = users.findIndex((user) => user.userId === userId);
    if (userIndex !== -1) {
      users[userIndex].x = x;
      users[userIndex].y = y;
    }

    // Emitir la lista actualizada de usuarios a todos los clientes
    io.emit('mousemove', users);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      // Eliminar usuario de la lista al desconectarse
      users = users.filter((user) => user.userId !== socket.userId);

      // Emitir la lista actualizada de usuarios a todos los clientes
      io.emit('mousemove', users);

      io.emit('userDisconnected', `${socket.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
