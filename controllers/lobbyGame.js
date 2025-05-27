const { createBoard } = require('../game/board');
const {games} = require('./gameController')

const initializeGame = (req, res) => {
  const roomId = req.body.roomId;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID é obrigatório.' });
  }

  if (games[roomId]) {
    return res.status(400).json({ error: 'Jogo já existe para esta sala.' });
  }

  // Cria a sala com o jogador 1 automaticamente
  games[roomId] = {
    players: {
      1: { id: 1, board: createBoard(), shipsPlaced: false },
    },
    readyToStart: false,
    currentTurn: null, // Define-se somente quando ambos os jogadores estiverem prontos
  };

  res.status(200).json({ message: 'Sala criada com sucesso.', playerId: 1 });
};

const joinGame = (req, res) => {
  const roomId = req.body.roomId;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID é obrigatório.' });
  }

  const game = games[roomId];

  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  // Verifica se a sala já está cheia
  if (game.players[2]) {
    return res.status(400).json({ error: 'Sala já está cheia.' });
  }

  // Adiciona o jogador 2 automaticamente
  game.players[2] = { id: 2, board: createBoard(), shipsPlaced: false };

  res.status(200).json({ message: 'Jogador 2 entrou na sala.', playerId: 2 });
};


const getGameState = (req, res) => {
  const roomId = req.params.roomId;

  if (!games[roomId]) {
    return res.status(404).json({ error: 'Jogo não encontrado.' });
  }

  const game = games[roomId];
  res.status(200).json({
    players: {
      1: { shipsPlaced: game.players[1].shipsPlaced },
      2: game.players[2] ? { shipsPlaced: game.players[2].shipsPlaced } : null,
    },
    readyToStart: game.readyToStart,
    currentTurn: game.currentTurn,
  });
};

module.exports = { initializeGame, joinGame, getGameState };
