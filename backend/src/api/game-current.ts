import { Response } from 'express';
import Game from '../models/game.js';
import { AuthRequest } from '../types/index.js';

const getCurrentGame = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(400).json({ message: 'Unauthenticated' });
    }

    const currentGame = await Game.getCurrentGame();
    if (!currentGame) {
      return res.status(400).json({ message: 'Game not found' });
    }

    res.status(200).json(currentGame);
  } catch (error) {
    console.error('Get current game error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export default getCurrentGame;
