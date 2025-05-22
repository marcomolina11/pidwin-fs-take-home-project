import Game from '../models/game.js';
import Bet from '../models/bet.js';
import User from '../models/user.js';
import { io } from '../../index.js';
import {
  GAME_TIME_INTERVAL,
  LUCKY_SEVEN_MULTIPLYER,
  NON_LUCKY_SEVEN_MULTIPLYER,
} from '../constants/constants.js';

let gameInterval: NodeJS.Timeout | null = null;

export const startGameCycle = async () => {
  try {
    // Create initial game immediately
    let currentGame = await Game.create({});
    console.log('First game created with ID:', currentGame._id);

    // Set up interval for game cycles
    gameInterval = setInterval(async () => {
      try {
        console.log('Simulating dice roll...');
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;

        // Complete current game
        const updatedGame = await Game.findByIdAndUpdate(
          currentGame._id,
          {
            dice1,
            dice2,
            isComplete: true,
          },
          { new: true } // Return updated document
        );

        if (!updatedGame) {
          console.error('Failed to update game:', currentGame._id);
          return;
        }

        console.log('Game completed:', updatedGame._id);

        // Use virtual properties from the game model
        const rollResult = updatedGame.rollResult as number;
        const isLuckySeven = updatedGame.isLuckySeven as boolean;

        console.log('Dice roll results:', dice1, dice2, `(${rollResult})`);

        // Process all bets for this game
        const { userResults, affectedUsers } = await processBetsForGame(
          updatedGame._id.toString(),
          isLuckySeven
        );

        // Emit game result to all connected clients
        io.emit('gameResult', {
          id: updatedGame._id.toString(),
          dice1: updatedGame.dice1,
          dice2: updatedGame.dice2,
          rollResult, // Use the virtual property
          isLuckySeven, // Use the virtual property
          timestamp: updatedGame.createdAt,
          userResults,
          affectedUsers,
        });

        // Create new game
        const newGame = await Game.create({});
        if (!newGame) {
          console.error('Failed to create new game');
          return;
        }

        currentGame = newGame;
        console.log('New game created:', currentGame._id);
      } catch (error) {
        console.error('Error in game cycle:', error);
      }
    }, GAME_TIME_INTERVAL);
  } catch (initialError) {
    console.error('Error starting game cycle:', initialError);
  }
};

// Process all bets for a completed game
async function processBetsForGame(gameId: string, isLuckySeven: boolean) {
  try {
    // Find all bets for this game
    const bets = await Bet.find({ game: gameId });
    console.log(`Processing ${bets.length} bets for game ${gameId}`);

    // Store bet results for each user
    const userResults = new Map();
    const affectedUsers = new Map();

    for (const bet of bets) {
      // Determine win/lose
      const isWin = bet.isLuckySeven === isLuckySeven;
      const result = isWin ? 'win' : 'lose';

      // Calculate payout
      const payout = isWin ? calculatePayout(bet.amount, bet.isLuckySeven) : 0;

      // Update bet with result
      await Bet.findByIdAndUpdate(bet._id, { result });

      // Get user._id from bet
      const userId = bet.user.toString();

      // Update user tokens and streaks
      let updatedUser;
      if (isWin) {
        updatedUser = await updateUserForWin(userId, payout);
      } else {
        updatedUser = await updateUserForLoss(userId);
      }

      // Store this user's result
      userResults.set(userId, {
        userId: userId,
        result: result,
      });

      // Store updated user data for frontend
      if (updatedUser) {
        affectedUsers.set(userId, {
          _id: userId,
          tokens: updatedUser.tokens,
          currentWinStreak: updatedUser.currentWinStreak,
          highestWinStreak: updatedUser.highestWinStreak,
        });
      }
    }

    // Return both user results and affected users
    return {
      userResults: Object.fromEntries(userResults),
      affectedUsers: Object.fromEntries(affectedUsers),
    };
  } catch (error) {
    console.error('Error processing bets:', error);
    return { userResults: {}, affectedUsers: {} };
  }
}

// Calculate payout based on bet amount and type
function calculatePayout(amount: number, isLuckySeven: boolean): number {
  // Base payout includes original wager amount
  const baseAmount = amount;

  // Calculate winnings based on multiplier
  const multiplier = isLuckySeven
    ? LUCKY_SEVEN_MULTIPLYER
    : NON_LUCKY_SEVEN_MULTIPLYER;
  const winnings = amount * multiplier;

  // Total payout = original wager + winnings
  return baseAmount + winnings;
}

// Update user for winning bet
async function updateUserForWin(userId: string, payout: number) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const newWinStreak = user.currentWinStreak + 1;
    const highestWinStreak = Math.max(user.highestWinStreak, newWinStreak);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { tokens: payout },
        currentWinStreak: newWinStreak,
        highestWinStreak,
      },
      { new: true } // Return the updated document
    );

    console.log(`User ${userId} won ${payout} tokens, streak: ${newWinStreak}`);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user for win:', error);
    return null;
  }
}

// Update user for losing bet
async function updateUserForLoss(userId: string) {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { currentWinStreak: 0 },
      { new: true }
    );
    console.log(`User ${userId} lost, streak reset`);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user for loss:', error);
    return null;
  }
}

export const stopGameCycle = () => {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
    console.log('Game cycle stopped');
  }
};
