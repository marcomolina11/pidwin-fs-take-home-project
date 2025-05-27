import {
  unbiasedDieRoll,
  calculatePayout,
  updateUserForLoss,
  updateUserForWin,
  processBetsForGame,
} from './gameService.js';

// Define mock functions inside the factory function
jest.mock('../models/user.js', () => ({
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../models/bet.js', () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// Mocking the entire gameService to prevent starting game cycles
jest.mock('./gameService', () => {
  const originalModule = jest.requireActual('./gameService');
  return {
    ...originalModule,
    startGameCycle: jest.fn(),
    stopGameCycle: jest.fn(),
  };
});

// Import the mocked models after mocking
import User from '../models/user.js';
import Bet from '../models/bet.js';

describe('Game Service', () => {
  // Setup direct references to the mocks for convenience
  const mockUserFindByIdAndUpdate = User.findByIdAndUpdate as jest.Mock;
  const mockBetFind = Bet.find as jest.Mock;
  const mockBetFindByIdAndUpdate = Bet.findByIdAndUpdate as jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('unbiasedDieRoll', () => {
    test('should return a number between 1 and 6', () => {
      // Run multiple rolls to verify the range
      for (let i = 0; i < 1000; i++) {
        const roll = unbiasedDieRoll();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('calculatePayout', () => {
    test('should calculate correct payout for Lucky Seven', () => {
      const amount = 10;
      const isLuckySeven = true;
      const payout = calculatePayout(amount, isLuckySeven);
      expect(payout).toBe(80);
    });

    test('should calculate correct payout for Not Seven', () => {
      const amount = 10;
      const isLuckySeven = false;
      const payout = calculatePayout(amount, isLuckySeven);
      expect(payout).toBe(20);
    });
  });

  describe('updateUserForWin', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('should return updated user with new tokens and win streaks', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        currentWinStreak: 1,
        highestWinStreak: 5,
        tokens: 100,
      };
      mockUserFindByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await updateUserForWin('user123', 100);

      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        {
          $inc: { tokens: 100, currentWinStreak: 1 },
          $max: { highestWinStreak: { $add: ['$currentWinStreak', 1] } },
        },
        { new: true, projection: { password: 0 } }
      );
      expect(result).toBe(mockUser);
    });

    test('should return null if no user is found', async () => {
      mockUserFindByIdAndUpdate.mockResolvedValue(null);

      const result = await updateUserForWin('nonexistent', 100);

      expect(mockUserFindByIdAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should handle errors and return null', async () => {
      mockUserFindByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await updateUserForWin('user123', 100);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating user for win:',
        expect.any(Error)
      );
      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateUserForLoss', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should reset user win streak to 0', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        currentWinStreak: 0,
        highestWinStreak: 5,
        tokens: 100,
      };

      mockUserFindByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await updateUserForLoss('user123');

      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { currentWinStreak: 0 },
        { new: true, projection: { password: 0 } }
      );

      expect(result).toEqual(mockUser);
    });

    test('should return null if user is not found', async () => {
      mockUserFindByIdAndUpdate.mockResolvedValue(null);

      const result = await updateUserForLoss('nonexistent');

      expect(mockUserFindByIdAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should handle errors and return null', async () => {
      mockUserFindByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await updateUserForLoss('user123');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating user for loss:',
        expect.any(Error)
      );
      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('processBetsForGame', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset mock implementations to defaults
      mockBetFind.mockReset();
      mockBetFindByIdAndUpdate.mockReset();
      mockUserFindByIdAndUpdate.mockReset();
    });

    test('should return empty results when no bets are found and not log an error', async () => {
      // Mock Bet.find to return empty array
      mockBetFind.mockResolvedValue([]);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await processBetsForGame('game123', true);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        userResults: {},
        affectedUsers: {},
      });

      consoleErrorSpy.mockRestore();
    });

    test('should handle errors and return empty results when bet update fails', async () => {
      // Mock finding bets - this is required for the function to proceed to the update step
      mockBetFind.mockResolvedValue([
        {
          _id: 'bet123',
          user: 'user123',
          game: 'game123',
          amount: 50,
          isLuckySeven: true,
          result: 'pending',
        },
      ]);

      // Mock the update to fail
      mockBetFindByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      // Mock user update to succeed (so error comes from bet update)
      mockUserFindByIdAndUpdate.mockResolvedValue({
        _id: 'user123',
        name: 'Test User',
        tokens: 150,
        currentWinStreak: 1,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await processBetsForGame('game123', true);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing bets:',
        expect.any(Error)
      );
      expect(result).toEqual({
        userResults: {},
        affectedUsers: {},
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
