const { initializePlayerBoard } = require('../game/gameLogic');
const { createBoard } = require('../game/board');
const games = {};

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

const placeShips = (req, res) => {
  const { roomId, playerId } = req.params; // Extrai roomId e playerId da URL
  const playerMoves = req.body.moves; // Extrai os movimentos do corpo da requisição

  if (!roomId || !playerId || !playerMoves) {
    return res.status(400).json({ error: 'Room ID, Player ID e moves são obrigatórios.' });
  }

  const game = games[roomId];

  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  if (!game.players[playerId]) {
    return res.status(400).json({ error: 'Jogador inválido.' });
  }

  if (game.players[playerId].shipsPlaced) {
    return res.status(400).json({ error: 'Navios já foram posicionados para este jogador.' });
  }

  try {
    const board = initializePlayerBoard(playerMoves);
    game.players[playerId].board = board;
    game.players[playerId].shipsPlaced = true;

    // Verifica se ambos os jogadores já posicionaram os navios
    if (game.players[1].shipsPlaced && game.players[2] && game.players[2].shipsPlaced) {
      game.readyToStart = true;
      game.currentTurn = 1; // Define que o jogador 1 começa
    }

    // Transformar o board em uma matriz 6x6
    const matrixBoard = Array.from({ length: 6 }, () => Array(6).fill(0));
    for (let i = 0; i < board.length; i++) {
      const row = Math.floor(i / 6); // Linha calculada
      const col = i % 6; // Coluna calculada
      matrixBoard[row][col] = board[i]; // Preenche a matriz
    }

    res.status(200).json({
      message: `Navios posicionados para o jogador ${playerId}.`,
      board: matrixBoard,
      readyToStart: game.readyToStart,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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

module.exports = { initializeGame, joinGame, placeShips, getGameState };
