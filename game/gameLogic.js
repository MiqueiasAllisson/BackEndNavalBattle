const { createBoard, isValidPlacement, placeShipOnBoard } = require('./board');
const { ships } = require('./ships');

const initializePlayerBoard = (playerMoves) => {
  if (!Array.isArray(playerMoves)) {
    throw new Error("playerMoves precisa ser um array");
  }
  const board = createBoard();
  playerMoves.forEach((move, index) => {
    const { row, col, orientation } = move;
    const ship = ships[index];
    if (isValidPlacement(board, row, col, ship.size, orientation)) {
      placeShipOnBoard(board, row, col, ship.size, orientation, ship.id);
    } else {
      throw new Error(`Posição inválida para o navio ${ship.name}`);
    }
  });
  return board;
};

module.exports = {
  initializePlayerBoard,
};
