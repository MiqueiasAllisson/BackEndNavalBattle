const express = require('express');

const { initializeGame, getGameState} = 
require('../controllers/gameController');


const router = express.Router();


router.post('/initialize', initializeGame);

router.get ('/:roomId', getGameState);

module.exports = router; 