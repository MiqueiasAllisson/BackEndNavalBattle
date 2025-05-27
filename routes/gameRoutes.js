const express = require('express');

const { initializeGame, getGameState, placeShips, joinGame } = 
require('../controllers/gameController');


const router = express.Router();


router.post('/initialize', initializeGame);
router.post('/joinGame', joinGame);
router.post('/:roomId/player/:playerId/placeShips', placeShips);

router.get ('/:roomId', getGameState);

module.exports = router; 