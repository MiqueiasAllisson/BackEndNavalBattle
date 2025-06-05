// Cria um tabuleiro de tamanho especificado preenchido com zeros
const createBoard = (rows = 6, cols = 6) => {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
};

// Verifica se o posicionamento do navio é válido
const isValidPlacement = (board, row, col, size, orientation) => {
  if (orientation === 'H') {
    if (col + size > board[0].length) return false; // Fora do limite do tabuleiro

    for (let i = 0; i < size; i++) {
      if (board[row][col + i] !== 0) return false; // Célula já ocupada
    }
  } else if (orientation === 'V') {
    if (row + size > board.length) return false; // Fora do limite do tabuleiro

    for (let i = 0; i < size; i++) {
      if (board[row + i][col] !== 0) return false; // Célula já ocupada
    }
  } else {
    return false; // Orientação inválida
  }

  return true;
};

// Posiciona o navio no tabuleiro
// Posiciona o navio no tabuleiro
const placeShipOnBoard = (board, row, col, size, orientation, shipId) => {
  console.log(`🚢 Posicionando navio ID ${shipId} (tamanho: ${size}) em (${row}, ${col}) - ${orientation}`);
  
  if (orientation === 'H') {
    for (let i = 0; i < size; i++) {
      // ✅ MUDANÇA AQUI: usar 'ship' em vez de shipId
      board[row][col + i] = 'ship';
      console.log(`  Célula (${row}, ${col + i}) = 'ship'`);
    }
  } else if (orientation === 'V') {
    for (let i = 0; i < size; i++) {
      // ✅ MUDANÇA AQUI: usar 'ship' em vez de shipId
      board[row + i][col] = 'ship';
      console.log(`  Célula (${row + i}, ${col}) = 'ship'`);
    }
  }
  
  console.log('Tabuleiro após posicionamento:');
  board.forEach((boardRow, i) => {
    console.log(`Linha ${i}:`, boardRow);
  });
};

module.exports = {
  createBoard,
  isValidPlacement,
  placeShipOnBoard,
};