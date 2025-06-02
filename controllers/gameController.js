
const { games} = require('./initialGameController');


const startBattle = (req, res) => {
  const { roomId } = req.params;

  if (!games[roomId]) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  const game = games[roomId];

  // Configura o turno inicial e garante que os dados básicos do jogo estão prontos
  game.currentTurn = 'player1'; // Jogador 1 começa
  game.winner = null;

  res.status(200).json({ message: 'Batalha iniciada!', currentTurn: game.currentTurn });
};

const handleAttack = (req, res) => {
  const { roomId, playerId } = req.params;
  const { row, col } = req.body;

  const game = games[roomId];
  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  if (game.currentTurn !== playerId) {
    return res.status(403).json({ error: 'Não é sua vez!' });
  }

  const opponent = playerId === 'player1' ? 'player2' : 'player1';
  const opponentBoard = game.players[opponent].board;
  const opponentHits = game.players[opponent].hits;

  // Verifica se o ataque foi um acerto
  if (opponentBoard[row][col] === 'ship') {
    opponentHits.push({ row, col });
    opponentBoard[row][col] = 'hit'; // Marca como atingido

    // Verifica se todos os navios do oponente foram destruídos
    const allShipsDestroyed = opponentBoard.every((rowArray) =>
      rowArray.every((cell) => cell !== 'ship')
    );

    if (allShipsDestroyed) {
      game.winner = playerId; // Define o vencedor
      return res.status(200).json({ winner: playerId });
    }
  } else {
    opponentBoard[row][col] = 'miss'; // Marca como erro
  }

  // Alterna o turno
  game.currentTurn = opponent;

  res.status(200).json({
    message: 'Ataque processado com sucesso!',
    currentTurn: game.currentTurn,
    hits: opponentHits,
  });
};


const getGameState = (req, res) => {
  const { roomId } = req.params;

  console.log('Recebendo roomId:', roomId); // Log para depuração

  const game = games[roomId];
  if (!game) {
    console.log('Sala não encontrada:', roomId); // Log para depuração
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  res.status(200).json({
    status: game.status || 'waiting', // Retorna o status do jogo
    players: game.players || {}, // Retorna os jogadores na sala
  });
};




const initializeBattle = (roomId) => {
  const game = games[roomId];
  if (!game) {
    throw new Error('Sala não encontrada.');
  }

  if (game.status !== 'ready') {
    throw new Error('O jogo ainda não está pronto para começar.');
  }

  game.status = 'in-progress';
  game.turn = Object.keys(game.players)[0]; // Define o primeiro jogador como o inicial
  Object.values(game.players).forEach((player) => {
    player.hits = createBoard(); // Cria um tabuleiro para registrar os ataques
  });
};


// Função para processar um ataque
const attack = (req, res) => {
  const { roomId, playerId } = req.params;
  const { row, col } = req.body;

  if (!roomId || !playerId || row === undefined || col === undefined) {
    return res.status(400).json({ error: 'Room ID, Player ID, row e col são obrigatórios.' });
  }

  const game = games[roomId];
  if (!game) {
    return res.status(404).json({ error: 'Sala não encontrada.' });
  }

  if (game.status !== 'in-progress') { // Verifica se o jogo está em andamento
    return res.status(400).json({ error: 'O jogo ainda não começou.' });
  }

  const currentPlayer = game.turn;
  if (currentPlayer !== playerId) {
    return res.status(400).json({ error: 'Não é o seu turno.' });
  }

  const opponentId = Object.keys(game.players).find((id) => id !== playerId);
  const opponent = game.players[opponentId];

  if (!opponent || !opponent.board) {
    return res.status(400).json({ error: 'O tabuleiro do oponente não foi inicializado.' });
  }

  const opponentBoard = opponent.board;
  const playerHits = game.players[playerId].hits;

  // Verifica se a célula já foi atacada
  if (playerHits[row][col] !== 0) {
    return res.status(400).json({ error: 'Essa célula já foi atacada.' });
  }

  // Processa o ataque
  if (opponentBoard[row][col] !== 0) {
    playerHits[row][col] = 1; // Marca como acerto
    opponentBoard[row][col] = -1; // Marca o navio como atingido
    checkForWinner(game, opponentId); // Verifica se o jogo terminou
  } else {
    playerHits[row][col] = -1; // Marca como erro
  }

  // Alterna o turno
  game.turn = opponentId;

  res.status(200).json({
    message: `Ataque realizado na posição (${row}, ${col}).`,
    hit: opponentBoard[row][col] !== 0,
    board: playerHits,
  });
};


// Função para verificar se um jogador perdeu todos os navios
const checkForWinner = (game, opponentId) => {
  const opponentBoard = game.players[opponentId].board;

  for (let row = 0; row < opponentBoard.length; row++) {
    for (let col = 0; col < opponentBoard[row].length; col++) {
      if (opponentBoard[row][col] > 0) {
        return; // Ainda há navios não atingidos
      }
    }
  }

  // Se todos os navios foram destruídos, define o vencedor
  game.status = 'finished';
  game.winner = Object.keys(game.players).find((id) => id !== opponentId);
};




module.exports = { attack, startBattle,handleAttack, getGameState };