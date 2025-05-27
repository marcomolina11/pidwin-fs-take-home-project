import { Response } from 'express';
import getRecentRolls from './game-recent-rolls.js';
import Game from '../models/game.js';
import Bet from '../models/bet.js';
import { AuthRequest } from '../types/index.js';

// Mock the models
jest.mock('../models/game.js', () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn(),
}));

jest.mock('../models/bet.js', () => ({
  find: jest.fn(),
}));

describe('getRecentRolls API', () => {
  // Test setup
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request mock
    mockRequest = {
      userId: 'user123',
    };

    // Setup response mock
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should return recent rolls when authenticated with bets', async () => {
    // Mock data for games
    const mockGames = [
      {
        _id: 'game1',
        dice1: 4,
        dice2: 3,
        rollResult: 7,
        isLuckySeven: true,
        createdAt: new Date('2023-01-01'),
        toString: () => 'game1',
      },
      {
        _id: 'game2',
        dice1: 2,
        dice2: 2,
        rollResult: 4,
        isLuckySeven: false,
        createdAt: new Date('2023-01-02'),
        toString: () => 'game2',
      },
    ];

    // Mock data for bets
    const mockBets = [
      {
        game: { toString: () => 'game1' },
        user: 'user123',
        result: 'win',
      },
    ];

    // Setup mock behavior
    Game.find().sort().limit = jest.fn().mockResolvedValue(mockGames);
    Bet.find = jest.fn().mockResolvedValue(mockBets);

    // Call function to test
    await getRecentRolls(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.find).toHaveBeenCalledWith({ isComplete: true });
    expect(Bet.find).toHaveBeenCalledWith({
      game: { $in: expect.anything() },
      user: 'user123',
    });

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'game1',
        dice1: 4,
        dice2: 3,
        rollResult: 7,
        isLuckySeven: true,
        userResults: {
          user123: { userId: 'user123', result: 'win' },
        },
      }),
      expect.objectContaining({
        id: 'game2',
        dice1: 2,
        dice2: 2,
        rollResult: 4,
        isLuckySeven: false,
        userResults: {},
      }),
    ]);
  });

  test('should return 401 when not authenticated', async () => {
    // Remove user ID to simulate unauthenticated request
    mockRequest.userId = undefined;

    // Call function to test
    await getRecentRolls(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.find).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  test('should return empty array when no recent games', async () => {
    // Setup mock to return empty array
    Game.find().sort().limit = jest.fn().mockResolvedValue([]);

    // Call function to test
    await getRecentRolls(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.find).toHaveBeenCalledWith({ isComplete: true });
    expect(Bet.find).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith([]);
  });

  test('should handle errors properly', async () => {
    // Setup mock to throw error
    const error = new Error('Database error');
    Game.find().sort().limit = jest.fn().mockRejectedValue(error);

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Call function to test
    await getRecentRolls(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.find).toHaveBeenCalledWith({ isComplete: true });
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching recent rolls:',
      error
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Error fetching recent rolls',
    });

    // Clean up
    consoleSpy.mockRestore();
  });
});
