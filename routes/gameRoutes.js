const express = require('express');

const { initializeGame, getGameState, placeShip, joinGame } = 
require('../controllers/gameController');


const router = express.Router();


router.post('/initialize', initializeGame);
router.post('/joinGame', joinGame);
router.post('/:roomId/player/:playerId/placeShips', placeShip);

router.get ('/:roomId', getGameState);

module.exports = router; 