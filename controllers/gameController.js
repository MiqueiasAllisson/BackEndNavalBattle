const { games } = require('./initialGameController');

const startBattle = (req, res) => {
  const { roomId } = req.params;

  if (!games[roomId]) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const game = games[roomId];
  const playerKeys = Object.keys(game.players);
  
  console.log('=== INICIANDO BATALHA ===');
  console.log('Room ID:', roomId);
  console.log('Players encontrados:', playerKeys);
  console.log('Dados dos players:', game.players);

  // Configura o turno inicial
  game.currentTurn = playerKeys[0];
  game.winner = null;
  game.status = 'in-progress';

  // Inicializa hits para cada jogador
  playerKeys.forEach(playerId => {
    if (!game.players[playerId].hits) {
      game.players[playerId].hits = [];
    }
    console.log(`Player ${playerId} board:`, game.players[playerId].board);
  });

  console.log('Turno inicial definido como:', game.currentTurn);

  res.status(200).json({ 
    message: 'Batalha iniciada!', 
    currentTurn: game.currentTurn,
    players: game.players,
    status: 'in-progress'
  });
};

const getGameState = (req, res) => {
  const { roomId } = req.params;

  console.log('=== GET GAME STATE ===');
  console.log('Room ID solicitado:', roomId);

  const game = games[roomId];
  if (!game) {
    console.log('❌ Sala não encontrada:', roomId);
    console.log('Salas disponíveis:', Object.keys(games));
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  console.log('✅ Jogo encontrado');
  console.log('Current Turn:', game.currentTurn);
  console.log('Status:', game.status);
  console.log('Players:', Object.keys(game.players));
  
  // Log detalhado dos players
  Object.keys(game.players).forEach(playerId => {
    const player = game.players[playerId];
    console.log(`Player ${playerId}:`, {
      name: player.namePlayer,
      boardSize: player.board ? `${player.board.length}x${player.board[0]?.length}` : 'undefined',
      hitsCount: player.hits ? player.hits.length : 0
    });
  });

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

  console.log('=== DEBUG COMPLETO ===');
  console.log('Room ID:', roomId);
  console.log('Player ID que está atacando:', playerId, '(tipo:', typeof playerId, ')');
  
  const game = games[roomId];
  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  // 🔍 DEBUG CRÍTICO - VAMOS VER QUEM SÃO OS JOGADORES
  const playerKeys = Object.keys(game.players);
  console.log('🎮 TODOS OS JOGADORES NA SALA:');
  playerKeys.forEach(key => {
    console.log(`  - Jogador ${key} (tipo: ${typeof key}): ${game.players[key].namePlayer}`);
  });
  
  console.log('🎯 Current turn:', game.currentTurn, '(tipo:', typeof game.currentTurn, ')');
  
  // 🔍 ENCONTRAR OPONENTE
  const playerIdStr = String(playerId);
  console.log('🔄 Procurando oponente para:', playerIdStr);
  
  const opponent = playerKeys.find(key => {
    const keyStr = String(key);
    console.log(`  - Comparando "${keyStr}" !== "${playerIdStr}" = ${keyStr !== playerIdStr}`);
    return keyStr !== playerIdStr;
  });
  
  console.log('👤 OPONENTE ENCONTRADO:', opponent);
  console.log('🆚 RESUMO:');
  console.log(`  - Atacante: ${playerIdStr} (${game.players[playerIdStr]?.namePlayer})`);
  console.log(`  - Defensor: ${opponent} (${game.players[opponent]?.namePlayer})`);
  
  if (!opponent) {
    console.log('❌ ERRO: Oponente não encontrado!');
    return res.status(400).json({ error: 'Oponente não encontrado.' });
  }



  const opponentBoard = game.players[opponent].board;
  const opponentHits = game.players[opponent].hits || [];

  // Verifica se já foi atacado
  const alreadyAttacked = opponentHits.find(hit => hit.row === row && hit.col === col);
  if (alreadyAttacked) {
    return res.status(400).json({ error: 'Posição já atacada!' });
  }

  let hitResult;
  const cellValue = opponentBoard[row][col];
  
  if (cellValue === 'ship' || cellValue === 1 || cellValue === 2 || cellValue === 3) {
    // ✅ APENAS REGISTRA O HIT - NÃO MODIFICA O BOARD ORIGINAL
    opponentHits.push({ row, col, status: 'hit' });
    hitResult = 'hit';
    console.log('🎯 ACERTO!');

    // ✅ VERIFICAR VITÓRIA CONTANDO NAVIOS RESTANTES
    let totalShips = 0;
    let shipsHit = 0;
    
    for (let r = 0; r < opponentBoard.length; r++) {
      for (let c = 0; c < opponentBoard[r].length; c++) {
        const cell = opponentBoard[r][c];
        if (cell === 'ship' || cell === 1 || cell === 2 || cell === 3) {
          totalShips++;
          // Verifica se esta posição foi atingida
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
      console.log('🏆 VITÓRIA!', game.winner);
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
    
    // Se acertou, continua no mesmo turno
    // game.currentTurn permanece o mesmo
  } else {
    // ✅ MISS - APENAS REGISTRA, NÃO MODIFICA BOARD
    opponentHits.push({ row, col, status: 'miss' });
    hitResult = 'miss';
    console.log('💧 ÁGUA!');
    
    // Só troca turno se errou
    game.currentTurn = opponent;
  }

  console.log('Próximo turno:', game.currentTurn);

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
