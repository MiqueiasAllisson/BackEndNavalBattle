const createBoard = (rows = 6, cols = 6) => {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
};

const isValidPlacement = (board, row, col, size, orientation) => {
  if (orientation === 'H') {
    if (col + size > board[0].length) return false;
    for (let i = 0; i < size; i++) {
      if (board[row][col + i] !== 0) return false;
    }
  } else if (orientation === 'V') {
    if (row + size > board.length) return false;
    for (let i = 0; i < size; i++) {
      if (board[row + i][col] !== 0) return false;
    }
  } else {
    return false;
  }
  return true;
};

const placeShipOnBoard = (board, row, col, size, orientation, shipId) => {
  if (orientation === 'H') {
    for (let i = 0; i < size; i++) {
      board[row][col + i] = 'ship';
    }
  } else if (orientation === 'V') {
    for (let i = 0; i < size; i++) {
      board[row + i][col] = 'ship';
    }
  }
};

module.exports = {
  createBoard,
  isValidPlacement,
  placeShipOnBoard,
};
