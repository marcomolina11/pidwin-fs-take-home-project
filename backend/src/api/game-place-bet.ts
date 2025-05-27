import { Response } from 'express';
import Game from '../models/game.js';
import User from '../models/user.js';
import Bet from '../models/bet.js';
import { AuthRequest, PlaceBetRequest } from '../types/index.js';
import { createBetResponse } from '../utils/responseHelper.js';

const placeBet = async (req: AuthRequest, res: Response) => {
  const { amount, isLuckySeven }: PlaceBetRequest = req.body;

  try {
    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return createBetResponse(res, 400, 'User not found', 'rejected');
    }

    // Validate tokens
    if (user.tokens < amount) {
      return createBetResponse(res, 400, 'Insufficient tokens', 'rejected');
    }

    // Get current game
    const currentGame = await Game.getCurrentGame();
    if (!currentGame) {
      return createBetResponse(res, 400, 'No active game found', 'rejected');
    }

    // Check if current game still accept bets
    if (!currentGame.canAcceptBets) {
      return createBetResponse(
        res,
        200,
        'Sorry, the betting window closed',
        'rejected'
      );
    }

    // Check if user already placed a bet on this game
    const existingBet = await Bet.findOne({
      user: user._id,
      game: currentGame._id,
    });

    if (existingBet) {
      return createBetResponse(
        res,
        200,
        'You already placed a bet on this roll',
        'rejected'
      );
    }

    // Create bet - let any errors propagate to the outer catch block
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
      { new: true, projection: { password: 0 } }
    );

    if (!updatedUser) {
      // If user update fails revert bet creation
      await Bet.findByIdAndDelete(bet._id);
      return createBetResponse(
        res,
        500,
        'Failed to update user tokens',
        'rejected'
      );
    }

    return createBetResponse(
      res,
      200,
      'Bet Placed Successfully',
      'accepted',
      updatedUser
    );
  } catch (error: any) {
    console.error('Place bet error:', error);

    const errorMessage = error.message || 'Something went wrong';
    return createBetResponse(res, 500, errorMessage, 'rejected');
  }
};

export default placeBet;
