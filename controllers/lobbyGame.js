const { createBoard } = require('../game/board');
const {games} = require('./initialGameController')

const initializeGame = (req, res) => {
  const {roomId, nameTeam} = req.body;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID é obrigatório.' });
  }

  if (!nameTeam) {
    return res.status(400).json({ error: 'Digite um nome para sua Equipe.' });
  }

  if (games[roomId]) {
    return res.status(400).json({ error: 'Jogo já existe para esta sala.' });
  }

  games[roomId] = {
    players: {
      1: { id: 1, namePlayer: nameTeam, board: createBoard(), shipsPlaced: false },
    },
    readyToStart: false,
    currentTurn: null,
  };

  res.status(200).json({ message: 'Sala criada com sucesso.', playerId: 1, message: "Jogador:", nameTeam });
};

const joinGame = (req, res) => {
  const {roomId, nameTeam} = req.body;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID é obrigatório.' });
  }

  if (!nameTeam) {
    return res.status(400).json({ error: 'Digite um nome para sua Equipe.' });
  }

  const game = games[roomId];

  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  if (game.players[2]) {
    return res.status(400).json({ error: 'Sala já está cheia.' });
  }

  game.players[2] = { id: 2, namePlayer: nameTeam, board: createBoard(), shipsPlaced: false };

  res.status(200).json({ message: 'Jogador 2 entrou na sala.', playerId: 2, message: "Jogador:", nameTeam});
};

module.exports = { initializeGame, joinGame };
