const express = require('express');

const { placeShip, removeShip, getShips, setPlayerReady } = 
require('../controllers/initialGameController');

const { initializeGame, joinGame } = 
require('../controllers/lobbyGame');

const { startBattle, getGameState, handleAttack } = 
require('../controllers/gameController');

const router = express.Router();

// ========== ROTAS DE LOBBY ==========
router.post('/initialize', initializeGame);
router.post('/joinGame', joinGame);

// ========== ROTAS DE CONFIGURAÇÃO DE NAVIOS ==========
router.post('/:roomId/player/:playerId/placeShips', placeShip);
router.post('/:roomId/player/:playerId/setPlayerReady', setPlayerReady);
router.delete('/:roomId/player/:playerId/removeShip', removeShip);
router.get('/:roomId/player/:playerId/ships', getShips);

// ========== ROTAS DE BATALHA ==========
router.post('/:roomId/startBattle', startBattle);
router.get('/:roomId/state', getGameState);
router.post('/:roomId/player/:playerId/attack', handleAttack);

module.exports = router;
