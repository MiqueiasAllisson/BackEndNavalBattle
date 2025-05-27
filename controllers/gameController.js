const { ships } = require('../game/ships');
const { createBoard, placeShipOnBoard, isValidPlacement } = require('../game/board');
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

      player.placedShips.push(shipId);

      // Garante que todos os jogadores tenham `placedShips` inicializado antes de acessar `.length`
      Object.values(game.players).forEach(p => {
        if (!p.placedShips) {
          p.placedShips = [];
        }
      });

      // Verifica se todos os navios foram posicionados
      const allShipsPlaced = player.placedShips.length === ships.reduce((sum, s) => sum + s.maxAllowed, 0);

      if (
        allShipsPlaced &&
        Object.values(game.players).every(p => p.placedShips.length === ships.reduce((sum, s) => sum + s.maxAllowed, 0))
      ) {
        game.readyToStart = true;
        game.currentTurn = 1;
      }
      console.log(player.board)
      res.status(200).json({
        message: `Navio ${ship.name} posicionado com sucesso para o jogador ${playerId}.`,
        board: player.board,
        readyToStart: game.readyToStart || false,
      });
    } else {
      throw new Error(`Posição inválida para o navio ${ship.name}`);
    }
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

module.exports = { initializeGame, joinGame, placeShip, getGameState };
