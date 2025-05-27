import express from 'express';
import auth from '../utils/auth.js';
import placeBet from '../api/game-place-bet.js';
import getWinStreaks from '../api/game-win-streaks.js';
import getRecentRolls from '../api/game-recent-rolls.js';
import getCurrentGame from '../api/game-current.js';

const router = express.Router();

router.post('/placeBet', auth, placeBet);
router.get('/winStreaks', getWinStreaks);
router.get('/recentRolls', auth, getRecentRolls);
router.get('/currentGame', auth, getCurrentGame);

export default router;
