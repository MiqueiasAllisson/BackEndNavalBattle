const { ships } = require('../game/ships');
const { createBoard, placeShipOnBoard, isValidPlacement } = require('../game/board');
const games = {};

const getShips = (req, res) => {
  res.json(ships);
};

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

  const shipId = player.board[row][col];
  if (!shipId || shipId === 0) {
    return res.status(400).json({ error: 'Nenhum navio encontrado na posição fornecida.' });
  }

  // Encontra o navio específico que está sendo removido
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

  // Remove apenas as células ocupadas pelo navio específico
  for (let i = 0; i < shipToRemove.size; i++) {
    const r = shipToRemove.orientation === 'V' ? shipToRemove.row + i : shipToRemove.row;
    const c = shipToRemove.orientation === 'H' ? shipToRemove.col + i : shipToRemove.col;

    if (r >= 0 && r < player.board.length && c >= 0 && c < player.board[0].length) {
      player.board[r][c] = 0;
    }
  }

  // Remove o navio da lista de navios posicionados
  player.placedShips = player.placedShips.filter((ship) => ship !== shipToRemove);

  // Incrementa o número de navios restantes
  player.shipsRemaining[shipId] += 1;

  res.status(200).json({
    message: `Navio removido com sucesso da posição (${row}, ${col}).`,
    board: player.board,
    placedShips: player.placedShips,
    shipsRemaining: player.shipsRemaining,
  });
};

// Atualizar o estado de "pronto" do jogador
const setPlayerReady = (req, res) => {
  const { roomId, playerId } = req.params;

  // Verifica se os parâmetros foram fornecidos
  if (!roomId || !playerId) {
    return res.status(400).json({ error: 'Room ID e Player ID são obrigatórios.' });
  }

  // Verifica se a sala existe
  const game = games[roomId];
  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  // Verifica se os jogadores existem na sala
  if (!game.players || !game.players[playerId]) {
    return res.status(400).json({ error: 'Jogador inválido ou não encontrado na sala.' });
  }

  const player = game.players[playerId];

  // Verifica se o jogador posicionou todos os navios
  if (!player.shipsRemaining) {
    return res.status(400).json({ error: 'Os navios do jogador não foram inicializados.' });
  }

  const allShipsPlaced = Object.values(player.shipsRemaining).every((count) => count === 0);
  if (!allShipsPlaced) {
    return res.status(400).json({ error: 'Você deve posicionar todos os navios antes de ficar pronto.' });
  }

  // Atualiza o estado de prontidão do jogador
  player.ready = true;

  // Verifica se todos os jogadores estão prontos
  const allPlayersReady = Object.values(game.players).every((p) => p.ready);

  if (allPlayersReady) {
    game.status = 'ready';
    res.status(200).json({ message: 'Todos os jogadores estão prontos. O jogo pode começar!' });
  } else {
    res.status(200).json({ message: 'Você está pronto. Aguardando os outros jogadores.' });
  }
};


module.exports = { placeShip, games, removeShip, getShips, setPlayerReady };
