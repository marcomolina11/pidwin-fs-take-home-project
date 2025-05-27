import { Request, Response } from 'express';
import getWinStreaks from './game-win-streaks.js';

// Mock the User model with proper hoisting support
jest.mock('../models/user.js', () => {
  // Create the mock functions inside the factory function
  const mockSelect = jest.fn();
  const mockLimit = jest.fn().mockReturnValue({ select: mockSelect });
  const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
  const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

  return {
    find: mockFind,
  };
});

// Import after mocking
import User from '../models/user.js';

describe('getWinStreaks API', () => {
  // Recreate references to the mocks
  const mockFind = User.find as jest.Mock;
  const mockSort = mockFind().sort as jest.Mock;
  const mockLimit = mockSort().limit as jest.Mock;
  const mockSelect = mockLimit().select as jest.Mock;

  // Test setup
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request/response mocks
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should return top 10 users by win streak', async () => {
    // Mock data
    const mockTopUsers = [
      { _id: 'user1', name: 'Player One', highestWinStreak: 10 },
      { _id: 'user2', name: 'Player Two', highestWinStreak: 8 },
      { _id: 'user3', name: 'Player Three', highestWinStreak: 5 },
    ];

    // Configure the final select call to resolve with our mock users
    mockSelect.mockResolvedValue(mockTopUsers);

    // Call function to test
    await getWinStreaks(mockRequest as Request, mockResponse as Response);

    // Assert each function in the chain was called with the right args
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ highestWinStreak: -1 });
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockSelect).toHaveBeenCalledWith('name highestWinStreak');

    // Check the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockTopUsers);
  });

  test('should handle errors properly', async () => {
    // Setup mock to throw error
    const error = new Error('Database connection error');
    mockSelect.mockRejectedValue(error);

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Call function to test
    await getWinStreaks(mockRequest as Request, mockResponse as Response);

    // Assert results
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching top win streaks:',
      error
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Failed to fetch top win streaks',
    });

    // Clean up
    consoleSpy.mockRestore();
  });
});
