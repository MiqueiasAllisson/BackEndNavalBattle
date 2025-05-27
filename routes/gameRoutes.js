const express = require('express');

const { placeShip, removeShip } = 
require('../controllers/gameController');

const { initializeGame, getGameState, joinGame } = 
require('../controllers/lobbyGame');


const router = express.Router();


router.post('/initialize', initializeGame);
router.post('/joinGame', joinGame);
router.post('/:roomId/player/:playerId/placeShips', placeShip);
router.delete('/:roomId/player/:playerId/removeShip', removeShip);


router.get ('/:roomId', getGameState);

module.exports = router; 