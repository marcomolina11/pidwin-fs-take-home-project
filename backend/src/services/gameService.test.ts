import {
  unbiasedDieRoll,
  calculatePayout,
  updateUserForLoss,
  updateUserForWin,
  processBetsForGame,
} from './gameService.js';

// Mock models first
jest.mock('../models/user.js');
jest.mock('../models/bet.js');

// Import the mocked models
import User from '../models/user.js';
import Bet from '../models/bet.js';

// Mock the specific methods we need
const mockFindByIdAndUpdate = jest.fn();
const mockFind = jest.fn();

User.findByIdAndUpdate = mockFindByIdAndUpdate;
Bet.find = mockFind;
Bet.findByIdAndUpdate = mockFindByIdAndUpdate;

// Mocking the entire gameService to prevent starting game cycles
jest.mock('./gameService', () => {
  const originalModule = jest.requireActual('./gameService');
  return {
    ...originalModule,
    startGameCycle: jest.fn(),
    stopGameCycle: jest.fn(),
  };
});

describe('Game Service', () => {
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
      mockFindByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await updateUserForWin('user123', 100);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
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
      mockFindByIdAndUpdate.mockResolvedValue(null);

      const result = await updateUserForWin('nonexistent', 100);

      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should handle errors and return null', async () => {
      mockFindByIdAndUpdate.mockRejectedValue(new Error('Database error'));

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

      mockFindByIdAndUpdate.mockResolvedValue(mockUser);

      const result = await updateUserForLoss('user123');

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { currentWinStreak: 0 },
        { new: true, projection: { password: 0 } }
      );

      expect(result).toEqual(mockUser);
    });

    test('should return null if user is not found', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);

      const result = await updateUserForLoss('nonexistent');

      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should handle errors and return null', async () => {
      mockFindByIdAndUpdate.mockRejectedValue(new Error('Database error'));

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
    });

    test('should return empty results when no bets are found and not log an error', async () => {
      // Mock Bet.find to return empty array
      mockFind.mockResolvedValue([]);

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
      mockFindByIdAndUpdate.mockRejectedValue(new Error('Database error'));

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
