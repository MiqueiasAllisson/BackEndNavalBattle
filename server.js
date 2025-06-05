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

// ADICIONE ESTE MIDDLEWARE DE DEBUG
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// Rotas
app.use('/api/game', gameRoutes);

// Resto do código...
const games = {};

io.on('connection', (socket) => {
  console.log(`Jogador conectado: ${socket.id}`);
  // ... resto do código socket
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
