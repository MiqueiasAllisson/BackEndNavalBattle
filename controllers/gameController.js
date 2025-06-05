const { games } = require('./initialGameController');

const startBattle = (req, res) => {
  const { roomId } = req.params;

  if (!games[roomId]) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const game = games[roomId];
  const playerKeys = Object.keys(game.players);

  game.currentTurn = playerKeys[0];
  game.winner = null;
  game.status = 'in-progress';

  playerKeys.forEach(playerId => {
    if (!game.players[playerId].hits) {
      game.players[playerId].hits = [];
    }
  });

  res.status(200).json({ 
    message: 'Batalha iniciada!', 
    currentTurn: game.currentTurn,
    players: game.players,
    status: 'in-progress'
  });
};

const getGameState = (req, res) => {
  const { roomId } = req.params;

  const game = games[roomId];
  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  res.status(200).json({
    status: game.status || 'waiting',
    players: game.players || {},
    currentTurn: game.currentTurn || null,
    winner: game.winner || null
  });
};

const handleAttack = (req, res) => {
  const { roomId, playerId } = req.params;
  const { row, col } = req.body;

  const game = games[roomId];
  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const playerKeys = Object.keys(game.players);
  const playerIdStr = String(playerId);

  const opponent = playerKeys.find(key => String(key) !== playerIdStr);

  if (!opponent) {
    return res.status(400).json({ error: 'Oponente não encontrado.' });
  }

  const opponentBoard = game.players[opponent].board;
  const opponentHits = game.players[opponent].hits || [];

  const alreadyAttacked = opponentHits.find(hit => hit.row === row && hit.col === col);
  if (alreadyAttacked) {
    return res.status(400).json({ error: 'Posição já atacada!' });
  }

  let hitResult;
  const cellValue = opponentBoard[row][col];

  if (cellValue === 'ship' || cellValue === 1 || cellValue === 2 || cellValue === 3) {
    opponentHits.push({ row, col, status: 'hit' });
    hitResult = 'hit';

    let totalShips = 0;
    let shipsHit = 0;

    for (let r = 0; r < opponentBoard.length; r++) {
      for (let c = 0; c < opponentBoard[r].length; c++) {
        const cell = opponentBoard[r][c];
        if (cell === 'ship' || cell === 1 || cell === 2 || cell === 3) {
          totalShips++;
          const wasHit = opponentHits.find(hit => 
            hit.row === r && hit.col === c && hit.status === 'hit'
          );
          if (wasHit) {
            shipsHit++;
          }
        }
      }
    }

    if (totalShips === shipsHit) {
      game.winner = game.players[playerId].namePlayer || playerId;
      game.status = 'finished';
      return res.status(200).json({ 
        winner: game.winner,
        players: game.players,
        currentTurn: game.currentTurn,
        gameOver: true,
        hitResult: hitResult,
        targetRow: row,
        targetCol: col
      });
    }
  } else {
    opponentHits.push({ row, col, status: 'miss' });
    hitResult = 'miss';
    game.currentTurn = opponent;
  }

  res.status(200).json({
    message: 'Ataque processado!',
    currentTurn: game.currentTurn,
    players: game.players,
    winner: game.winner,
    hitResult: hitResult,
    targetRow: row,
    targetCol: col,
    gameOver: false
  });
};

module.exports = { startBattle, handleAttack, getGameState };
