const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/game', gameRoutes);

const games = {};

io.on('connection', (socket) => {
  // Código do socket.io aqui, sem logs de debug
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
