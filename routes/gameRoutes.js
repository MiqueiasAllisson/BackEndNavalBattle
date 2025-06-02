const express = require('express');

const { placeShip, removeShip, getShips, setPlayerReady } = 
require('../controllers/initialGameController');

const { initializeGame, joinGame } = 
require('../controllers/lobbyGame');

const { attack, startBattle, getGameState, handleAttack } = 
require('../controllers/gameController');

const router = express.Router();


router.post('/initialize', initializeGame);
router.post('/joinGame', joinGame);

router.post('/:roomId/player/:playerId/placeShips', placeShip);
router.post('/:roomId/player/:playerId/setPlayerReady', setPlayerReady);
router.delete('/:roomId/player/:playerId/removeShip', removeShip);

router.get('/:roomId', getShips);
router.get('/:roomId/state', getGameState);


router.post('/:roomId/startBattle', startBattle);
router.post('/:roomId/player/:playerId/', handleAttack);
router.post('/:roomId/player/:playerId/attack', attack);

module.exports = router;
