import { Response } from 'express';
import Game from '../models/game.js';
import User from '../models/user.js';
import Bet from '../models/bet.js';
import { AuthRequest, PlaceBetRequest } from '../types/index.js';

const placeBet = async (req: AuthRequest, res: Response) => {
  const { amount, isLuckySeven }: PlaceBetRequest = req.body;

  try {
    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Validate tokens
    if (user.tokens < amount) {
      return res.status(400).json({ message: 'Insufficient tokens' });
    }

    // Get current game
    const currentGame = await Game.getCurrentGame();
    if (!currentGame) {
      return res.status(400).json({ message: 'No active game found' });
    }

    console.log('currentGame: ', currentGame);

    // Check if we can still accept bets
    if (!currentGame.canAcceptBets) {
      return res
        .status(400)
        .json({ message: 'Sorry, the betting window closed' });
    }

    // Create bet and update user tokens
    const bet = await Bet.create({
      user: user._id,
      game: currentGame._id,
      amount,
      isLuckySeven,
      result: 'pending',
    });

    // Deduct tokens from user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { tokens: -amount } },
      { new: true }
    );

    res.status(200).json({ message: 'Bet Placed Successfully', updatedUser });
    //res.status(200).json({ message: "Bet placed successfully", bet });
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export default placeBet;
