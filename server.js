const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir conexões de qualquer origem
  },
});

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/game', gameRoutes);

// WebSocket
const games = {}; // Armazena os jogos ativos

// Evento de conexão do Socket.IO
io.on('connection', (socket) => {
  console.log(`Jogador conectado: ${socket.id}`);

  // Jogador entra em uma sala
  socket.on('joinGame', (room) => {
    socket.join(room);
    console.log(`Jogador ${socket.id} entrou na sala ${room}`);

    if (!games[room]) {
      games[room] = { players: [], board: null };
    }

    games[room].players.push(socket.id);

    if (games[room].players.length === 2) {
      io.to(room).emit('startGame', { message: 'O jogo começou!' });
    }
  });

  // Recebe jogadas
  socket.on('makeMove', ({ room, row, col }) => {
    console.log(`Jogada recebida: Sala ${room}, Linha ${row}, Coluna ${col}`);
  });

  // Jogador desconecta
  socket.on('disconnect', () => {
    console.log(`Jogador desconectado: ${socket.id}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});