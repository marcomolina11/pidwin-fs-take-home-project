import { Response } from 'express';
import getCurrentGame from './game-current.js';
import Game from '../models/game.js';
import { AuthRequest } from '../types/index.js';

// Mock the Game model
jest.mock('../models/game.js', () => ({
  getCurrentGame: jest.fn(),
}));

describe('getCurrentGame API', () => {
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

  test('should return current game when authenticated', async () => {
    // Mock data
    const mockGame = {
      _id: 'game123',
      isComplete: false,
      createdAt: new Date(),
      bets: [],
      canAcceptBets: true,
    };

    // Setup mock behavior
    Game.getCurrentGame = jest.fn().mockResolvedValue(mockGame);

    // Call function to test
    await getCurrentGame(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.getCurrentGame).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockGame);
  });

  test('should return 400 when not authenticated', async () => {
    // Remove user ID to simulate unauthenticated request
    mockRequest.userId = undefined;

    // Call function to test
    await getCurrentGame(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.getCurrentGame).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Unauthenticated',
    });
  });

  test('should return 400 when game not found', async () => {
    // Setup mock behavior
    Game.getCurrentGame = jest.fn().mockResolvedValue(null);

    // Call function to test
    await getCurrentGame(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.getCurrentGame).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Game not found',
    });
  });

  test('should return 500 when error occurs', async () => {
    // Setup mock behavior
    const error = new Error('Database error');
    Game.getCurrentGame = jest.fn().mockRejectedValue(error);

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Call function to test
    await getCurrentGame(mockRequest as AuthRequest, mockResponse as Response);

    // Assert results
    expect(Game.getCurrentGame).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Get current game error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Something went wrong',
    });

    // Clean up
    consoleSpy.mockRestore();
  });
});
