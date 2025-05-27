const { ships } = require('../game/ships');
const { createBoard, placeShipOnBoard, isValidPlacement } = require('../game/board');
const games = {};

const readline = require('readline'); // Importa o módulo para ler entrada do console estou utilizando para teste!


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Função para posicionar um navio
const placeShip = (req, res) => {
  const { roomId, playerId } = req.params;
  const { row, col, orientation, shipId } = req.body;

  if (!roomId || !playerId || row === undefined || col === undefined || !orientation || !shipId) {
    return res.status(400).json({ error: 'Room ID, Player ID, row, col, orientation e shipId são obrigatórios.' });
  }

  const game = games[roomId];

  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const player = game.players[playerId];

  if (!player) {
    return res.status(400).json({ error: 'Jogador inválido.' });
  }

  if (!player.board) {
    player.board = createBoard();
  }

  // Garante que `placedShips` esteja inicializado como um array vazio
  if (!player.placedShips) {
    player.placedShips = [];
  }

  const ship = ships.find(s => s.id === shipId);

  if (!ship) {
    return res.status(400).json({ error: 'Navio inválido.' });
  }

  // Verifica se o jogador já usou a quantidade máxima permitida do navio
  const placedCount = player.placedShips.filter(id => id === shipId).length;
  if (placedCount >= ship.maxAllowed) {
    return res.status(400).json({ error: `Você já posicionou o número máximo permitido de ${ship.name}.` });
  }

  // Tenta posicionar o navio no tabuleiro
  try {
    if (isValidPlacement(player.board, row, col, ship.size, orientation)) {
      placeShipOnBoard(player.board, row, col, ship.size, orientation, ship.id);

      player.placedShips.push(ship.id);
      console.log(player.board)
      res.status(200).json({
        message: `Navio ${ship.name} posicionado com sucesso na posição (${row}, ${col}).`,
        board: player.board,
        placedShips: player.placedShips,
      });
    } else {
      throw new Error(`Posição inválida para o navio ${ship.name}`);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Função para remover um navio
const removeShip = (req, res) => {
  const { roomId, playerId } = req.params;
  const { row, col } = req.body;

  if (!roomId || !playerId || row === undefined || col === undefined) {
    return res.status(400).json({ error: 'Room ID, Player ID, row e col são obrigatórios.' });
  }

  const game = games[roomId];

  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const player = game.players[playerId];

  if (!player) {
    return res.status(400).json({ error: 'Jogador inválido.' });
  }

  if (!player.board) {
    return res.status(400).json({ error: 'O tabuleiro do jogador não foi inicializado.' });
  }

  // Verifica se há um navio na posição fornecida
  const shipId = player.board[row][col];
  if (!shipId || shipId === 0) {
    return res.status(400).json({ error: 'Nenhum navio encontrado na posição fornecida.' });
  }

  // Encontra o navio correspondente
  const ship = ships.find(s => s.id === shipId);
  if (!ship) {
    return res.status(400).json({ error: 'Navio inválido encontrado na posição fornecida.' });
  }

  // Remove o navio do tabuleiro
  for (let r = 0; r < player.board.length; r++) {
    for (let c = 0; c < player.board[r].length; c++) {
      if (player.board[r][c] === shipId) {
        player.board[r][c] = 0; // Limpa a posição no tabuleiro
      }
    }
  }

  // Remove o navio da lista de navios posicionados
  const shipIndex = player.placedShips.indexOf(shipId);
  if (shipIndex > -1) {
    player.placedShips.splice(shipIndex, 1);
  }

  console.log(player.board)

  res.status(200).json({
    message: `Navio ${ship.name} removido com sucesso da posição (${row}, ${col}).`,
    board: player.board,
    placedShips: player.placedShips,
  });
};



module.exports = {  placeShip, games, removeShip };
