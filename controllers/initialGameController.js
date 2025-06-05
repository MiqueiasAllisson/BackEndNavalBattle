const { ships } = require('../game/ships');
const { createBoard, placeShipOnBoard, isValidPlacement } = require('../game/board');
const games = {};

const getShips = (req, res) => {
  res.json(ships);
};

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

  if (!player.placedShips) {
    player.placedShips = [];
  }

  if (!player.shipsRemaining) {
    player.shipsRemaining = ships.reduce((acc, ship) => {
      acc[ship.id] = ship.maxAllowed;
      return acc;
    }, {});
  }

  const ship = ships.find((s) => s.id === shipId);
  if (!ship) {
    return res.status(400).json({ error: 'Navio inválido.' });
  }

  if (player.shipsRemaining[shipId] <= 0) {
    return res.status(400).json({ error: `Você já posicionou o número máximo permitido de ${ship.name}.` });
  }

  try {
    if (isValidPlacement(player.board, row, col, ship.size, orientation)) {
      placeShipOnBoard(player.board, row, col, ship.size, orientation, shipId);

      player.placedShips.push({ id: shipId, row, col, orientation, size: ship.size });
      player.shipsRemaining[shipId] -= 1;

      res.status(200).json({
        message: `Navio ${ship.name} posicionado com sucesso na posição (${row}, ${col}).`,
        board: player.board,
        placedShips: player.placedShips,
        shipsRemaining: player.shipsRemaining,
      });
    } else {
      throw new Error(`Posição inválida para o navio ${ship.name}`);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

  const shipId = player.board[row][col];
  if (!shipId || shipId === 0) {
    return res.status(400).json({ error: 'Nenhum navio encontrado na posição fornecida.' });
  }

  const shipToRemove = player.placedShips.find(
    (ship) =>
      ship.id === shipId &&
      row >= ship.row &&
      row < ship.row + (ship.orientation === 'V' ? ship.size : 1) &&
      col >= ship.col &&
      col < ship.col + (ship.orientation === 'H' ? ship.size : 1)
  );

  if (!shipToRemove) {
    return res.status(400).json({ error: 'Navio não encontrado na posição fornecida.' });
  }

  for (let i = 0; i < shipToRemove.size; i++) {
    const r = shipToRemove.orientation === 'V' ? shipToRemove.row + i : shipToRemove.row;
    const c = shipToRemove.orientation === 'H' ? shipToRemove.col + i : shipToRemove.col;

    if (r >= 0 && r < player.board.length && c >= 0 && c < player.board[0].length) {
      player.board[r][c] = 0;
    }
  }

  player.placedShips = player.placedShips.filter((ship) => ship !== shipToRemove);
  player.shipsRemaining[shipId] += 1;

  res.status(200).json({
    message: `Navio removido com sucesso da posição (${row}, ${col}).`,
    board: player.board,
    placedShips: player.placedShips,
    shipsRemaining: player.shipsRemaining,
  });
};

const setPlayerReady = (req, res) => {
  const { roomId, playerId } = req.params;

  if (!roomId || !playerId) {
    return res.status(400).json({ error: 'Room ID e Player ID são obrigatórios.' });
  }

  const game = games[roomId];
  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const player = game.players[playerId];
  if (!player) {
    return res.status(400).json({ error: 'Jogador inválido ou não encontrado na sala.' });
  }

  player.ready = true;

  const allPlayersReady = Object.values(game.players).every((p) => p.ready);

  if (allPlayersReady) {
    game.status = 'ready';
  }

  res.status(200).json({ message: 'Jogador marcado como pronto.', status: game.status });
};

module.exports = { placeShip, games, removeShip, getShips, setPlayerReady };
