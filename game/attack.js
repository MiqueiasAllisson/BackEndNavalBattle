// game/attack.js
const CELL_STATES = {
  EMPTY: 0,
  MISS: -1,
  HIT: -2,
  SUNK: -3
};

// Verifica se um ataque é válido
const isValidAttack = (targetBoard, attackHistory, row, col) => {
  // Verifica limites do tabuleiro
  if (row < 0 || row >= targetBoard.length || col < 0 || col >= targetBoard[0].length) {
    return false;
  }
  
  // Verifica se a posição já foi atacada
  const key = `${row},${col}`;
  return !attackHistory.has(key);
};

// Processa um ataque
const processAttack = (targetBoard, row, col, targetShips) => {
  const cellValue = targetBoard[row][col];
  
  if (cellValue === 0) {
    // Água - errou
    return {
      hit: false,
      sunk: false,
      shipId: null,
      result: CELL_STATES.MISS
    };
  } else {
    // Acertou um navio
    const shipId = cellValue;
    
    // Encontra o navio atingido
    const hitShip = targetShips.find(ship => ship.id === shipId);
    if (!hitShip) {
      throw new Error('Navio não encontrado');
    }
    
    // Registra o hit
    if (!hitShip.hits) {
      hitShip.hits = [];
    }
    hitShip.hits.push({ row, col });
    
    // Verifica se o navio foi afundado
    const isSunk = hitShip.hits.length === hitShip.size;
    
    return {
      hit: true,
      sunk: isSunk,
      shipId: shipId,
      shipName: hitShip.name || `Navio ${shipId}`,
      result: isSunk ? CELL_STATES.SUNK : CELL_STATES.HIT
    };
  }
};

// Verifica se todos os navios foram afundados
const checkGameOver = (playerShips) => {
  return playerShips.every(ship => ship.hits && ship.hits.length === ship.size);
};

// Cria um tabuleiro de visualização para o oponente
const createOpponentView = (board, attackHistory) => {
  const viewBoard = board.map(row => row.map(() => 0));
  
  attackHistory.forEach(attack => {
    viewBoard[attack.row][attack.col] = attack.result;
  });
  
  return viewBoard;
};

module.exports = {
  isValidAttack,
  processAttack,
  checkGameOver,
  createOpponentView,
  CELL_STATES
};
