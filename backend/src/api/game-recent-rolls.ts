import { Response } from 'express';
import Game from '../models/game.js';
import Bet from '../models/bet.js';
import { AuthRequest, UserResults, UserResultValue } from '../types/index.js';

const getRecentRolls = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.userId as string;

    // Get the last 5 completed games
    const recentGames = await Game.find({ isComplete: true })
      .sort({ createdAt: -1 })
      .limit(5);

    if (!recentGames.length) {
      return res.status(200).json([]);
    }

    // Get all the game ids
    const gameIds = recentGames.map((game) => game._id);

    // Find all bets for these games made by the current user
    const userBets = await Bet.find({
      game: { $in: gameIds },
      user: userId,
    });

    // Create a map of game id to user bet result
    const userBetResults = new Map<string, UserResultValue>();
    userBets.forEach((bet) => {
      userBetResults.set(bet.game.toString(), {
        userId: userId,
        result: bet.result,
      });
    });

    const formattedResults = recentGames.map((game) => {
      const userResults: UserResults = {};
      const gameId = game._id.toString();
      if (userBetResults.has(gameId)) {
        userResults[userId] = userBetResults.get(gameId)!;
      }

      return {
        id: gameId,
        dice1: game.dice1,
        dice2: game.dice2,
        rollResult: game.rollResult,
        isLuckySeven: game.isLuckySeven,
        timestamp: game.createdAt,
        userResults,
      };
    });

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error fetching recent rolls:', error);
    res.status(500).json({ message: 'Error fetching recent rolls' });
  }
};

export default getRecentRolls;
