const express = require('express');

const { placeShip, removeShip, getShips, setPlayerReady } = 
require('../controllers/initialGameController');


const { initializeGame, getGameState, joinGame } = 
require('../controllers/lobbyGame');


const router = express.Router();


router.post('/initialize', initializeGame);
router.post('/joinGame', joinGame);
router.post('/:roomId/player/:playerId/placeShips', placeShip);
router.post('/:roomId/player/:playerId/setPlayerReady', setPlayerReady);

router.delete('/:roomId/player/:playerId/removeShip', removeShip);

router.get ('/:roomId', getShips);
router.get ('/:roomId', getGameState);

module.exports = router; 