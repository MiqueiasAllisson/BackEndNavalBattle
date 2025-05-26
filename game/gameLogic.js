const { createBoard, isValidPlacement, placeShipOnBoard } = require('./board');

// Configuração inicial dos navios
const ships = [
  { id: 1, name: 'Submarino', size: 1 },
  { id: 2, name: 'Submarino', size: 1 },
  { id: 3, name: 'Submarino', size: 1 },
  { id: 4, name: 'Torpedeiro', size: 2 },
  { id: 5, name: 'Torpedeiro', size: 2 },
  { id: 6, name: 'Porta-avião', size: 3 },
];

// Função para inicializar o tabuleiro e permitir que o jogador posicione os navios
const initializePlayerBoard = (playerMoves) => {
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