import Game from '../models/game.js';
import Bet from '../models/bet.js';
import User from '../models/user.js';
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
        const rollResult = dice1 + dice2;
        const isLuckySeven = rollResult === 7;

        console.log('Dice roll results:', dice1, dice2, `(${rollResult})`);

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

        // Process all bets for this game
        await processBetsForGame(updatedGame._id, isLuckySeven);

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

    for (const bet of bets) {
      // Determine win/lose
      const isWin = bet.isLuckySeven === isLuckySeven;
      const result = isWin ? 'win' : 'lose';

      // Calculate payout
      const payout = isWin ? calculatePayout(bet.amount, bet.isLuckySeven) : 0;

      // Update bet with result
      await Bet.findByIdAndUpdate(bet._id, { result });

      // Update user tokens and streaks
      if (isWin) {
        await updateUserForWin(bet.user.toString(), payout);
      } else {
        await updateUserForLoss(bet.user.toString());
      }
    }
  } catch (error) {
    console.error('Error processing bets:', error);
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
    if (!user) return;

    // Increase tokens by payout
    // Update win streak (increment current, update highest if needed)
    const newWinStreak = user.currentWinStreak + 1;
    const highestWinStreak = Math.max(user.highestWinStreak, newWinStreak);

    await User.findByIdAndUpdate(userId, {
      $inc: { tokens: payout },
      currentWinStreak: newWinStreak,
      highestWinStreak,
    });

    console.log(`User ${userId} won ${payout} tokens, streak: ${newWinStreak}`);
  } catch (error) {
    console.error('Error updating user for win:', error);
  }
}

// Update user for losing bet
async function updateUserForLoss(userId: string) {
  try {
    await User.findByIdAndUpdate(userId, { currentWinStreak: 0 });
    console.log(`User ${userId} lost, streak reset`);
  } catch (error) {
    console.error('Error updating user for loss:', error);
  }
}

export const stopGameCycle = () => {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
    console.log('Game cycle stopped');
  }
};
