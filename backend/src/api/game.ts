import express from 'express';
import placeBet from './game-place-bet.js';
import getRecentRolls from './game-recent-rolls.js';
import auth from '../utils/auth.js';
import getWinStreaks from './game-win-streaks.js';

const router = express.Router();

router.post('/placeBet', auth, placeBet);
router.get('/winStreaks', getWinStreaks);
router.get('/recentRolls', auth, getRecentRolls);

export default router;
