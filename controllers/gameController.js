const { createBoard, placeShips } = require('../game/board');
const games = {}; 


const initializeGame = (req, res) => {
  const roomId = req.body.roomId;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID é obrigatório.' });
  }

  if (games[roomId]) {
    return res.status(400).json({ error: 'Jogo já existe para esta sala.' });
  }

/*   const board = createBoard(6, 6);
  placeShips(board);

  games[roomId] = { board, players: [] }; */

  res.status(200).json({ message: 'Jogo inicializado com sucesso.'/* , board */ });
};


const getGameState = (req, res) => {
  const roomId = req.params.roomId;

  if (!games[roomId]) {
    return res.status(404).json({ error: 'Jogo não encontrado.' });
  }

  res.status(200).json({ board: games[roomId].board });
};

module.exports = { initializeGame, getGameState }; 