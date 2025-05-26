import { Response } from 'express';
import placeBet from './game-place-bet.js';
import Game from '../models/game.js';
import User from '../models/user.js';
import Bet from '../models/bet.js';
import { AuthRequest } from '../types/index.js';
import * as responseHelper from '../utils/responseHelper.js';

// Mock the models and helper
jest.mock('../models/game.js', () => ({
  getCurrentGame: jest.fn(),
}));

jest.mock('../models/user.js', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../models/bet.js', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../utils/responseHelper.js', () => ({
  createBetResponse: jest.fn(),
}));

describe('placeBet API', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request mock
    mockRequest = {
      userId: 'user123',
      body: {
        amount: 50,
        isLuckySeven: true,
      },
    };

    // Setup response mock
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Default response helper mock
    (responseHelper.createBetResponse as jest.Mock).mockImplementation(
      (res, status, message, result, data) => {
        res.status(status).json({ message, result, data });
        return res;
      }
    );
  });

  test('should place bet successfully when all conditions are met', async () => {
    // Mock data
    const mockUser = {
      _id: 'user123',
      tokens: 100,
    };

    const mockGame = {
      _id: 'game123',
      canAcceptBets: true,
    };

    const mockBet = {
      _id: 'bet123',
      user: 'user123',
      game: 'game123',
    };

    const mockUpdatedUser = {
      _id: 'user123',
      tokens: 50,
    };

    // Setup mock behaviors
    User.findById = jest.fn().mockResolvedValue(mockUser);
    Game.getCurrentGame = jest.fn().mockResolvedValue(mockGame);
    Bet.findOne = jest.fn().mockResolvedValue(null);
    Bet.create = jest.fn().mockResolvedValue(mockBet);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);

    // Call function to test
    await placeBet(mockRequest as AuthRequest, mockResponse as Response);

    // Verify correct functions were called
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(Game.getCurrentGame).toHaveBeenCalled();
    expect(Bet.findOne).toHaveBeenCalledWith({
      user: mockUser._id,
      game: mockGame._id,
    });
    expect(Bet.create).toHaveBeenCalledWith({
      user: mockUser._id,
      game: mockGame._id,
      amount: 50,
      isLuckySeven: true,
      result: 'pending',
    });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      mockUser._id,
      { $inc: { tokens: -50 } },
      { new: true, projection: { password: 0 } }
    );
    expect(responseHelper.createBetResponse).toHaveBeenCalledWith(
      mockResponse,
      200,
      'Bet Placed Successfully',
      'accepted',
      mockUpdatedUser
    );
  });

  test('should reject bet when user is not found', async () => {
    // Setup mock behavior
    User.findById = jest.fn().mockResolvedValue(null);

    // Call function to test
    await placeBet(mockRequest as AuthRequest, mockResponse as Response);

    // Verify behavior
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(Game.getCurrentGame).not.toHaveBeenCalled();
    expect(responseHelper.createBetResponse).toHaveBeenCalledWith(
      mockResponse,
      400,
      'User not found',
      'rejected'
    );
  });

  test('should reject bet when user has insufficient tokens', async () => {
    // Setup mock user with insufficient tokens
    const mockUser = {
      _id: 'user123',
      tokens: 30, // Less than bet amount of 50
    };

    User.findById = jest.fn().mockResolvedValue(mockUser);

    // Call function to test
    await placeBet(mockRequest as AuthRequest, mockResponse as Response);

    // Verify behavior
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(responseHelper.createBetResponse).toHaveBeenCalledWith(
      mockResponse,
      400,
      'Insufficient tokens',
      'rejected'
    );
  });

  test('should reject bet when no active game is found', async () => {
    // Setup mocks
    const mockUser = {
      _id: 'user123',
      tokens: 100,
    };

    User.findById = jest.fn().mockResolvedValue(mockUser);
    Game.getCurrentGame = jest.fn().mockResolvedValue(null);

    // Call function to test
    await placeBet(mockRequest as AuthRequest, mockResponse as Response);

    // Verify behavior
    expect(Game.getCurrentGame).toHaveBeenCalled();
    expect(responseHelper.createBetResponse).toHaveBeenCalledWith(
      mockResponse,
      400,
      'No active game found',
      'rejected'
    );
  });

  test('should reject bet when betting window is closed', async () => {
    // Setup mocks
    const mockUser = {
      _id: 'user123',
      tokens: 100,
    };

    const mockGame = {
      _id: 'game123',
      canAcceptBets: false, // Betting window closed
    };

    User.findById = jest.fn().mockResolvedValue(mockUser);
    Game.getCurrentGame = jest.fn().mockResolvedValue(mockGame);

    // Call function to test
    await placeBet(mockRequest as AuthRequest, mockResponse as Response);

    // Verify behavior
    expect(responseHelper.createBetResponse).toHaveBeenCalledWith(
      mockResponse,
      200,
      'Sorry, the betting window closed',
      'rejected'
    );
  });

  test('should reject bet when user already placed a bet on this game', async () => {
    // Setup mocks
    const mockUser = {
      _id: 'user123',
      tokens: 100,
    };

    const mockGame = {
      _id: 'game123',
      canAcceptBets: true,
    };

    const existingBet = {
      _id: 'existingBet123',
      user: 'user123',
      game: 'game123',
    };

    User.findById = jest.fn().mockResolvedValue(mockUser);
    Game.getCurrentGame = jest.fn().mockResolvedValue(mockGame);
    Bet.findOne = jest.fn().mockResolvedValue(existingBet);

    // Call function to test
    await placeBet(mockRequest as AuthRequest, mockResponse as Response);

    // Verify behavior
    expect(Bet.findOne).toHaveBeenCalled();
    expect(responseHelper.createBetResponse).toHaveBeenCalledWith(
      mockResponse,
      200,
      'You already placed a bet on this roll',
      'rejected'
    );
  });

  test('should handle errors during bet placement', async () => {
    // Setup mocks
    const mockUser = {
      _id: 'user123',
      tokens: 100,
    };

    const mockGame = {
      _id: 'game123',
      canAcceptBets: true,
    };

    User.findById = jest.fn().mockResolvedValue(mockUser);
    Game.getCurrentGame = jest.fn().mockResolvedValue(mockGame);
    Bet.findOne = jest.fn().mockResolvedValue(null);

    // Make bet creation throw an error
    const error = new Error('Database connection error');
    Bet.create = jest.fn().mockRejectedValue(error);

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Call function to test
    await placeBet(mockRequest as AuthRequest, mockResponse as Response);

    // Verify behavior
    expect(consoleErrorSpy).toHaveBeenCalledWith('Place bet error:', error);
    expect(responseHelper.createBetResponse).toHaveBeenCalledWith(
      mockResponse,
      500,
      'Database connection error',
      'rejected'
    );

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});
