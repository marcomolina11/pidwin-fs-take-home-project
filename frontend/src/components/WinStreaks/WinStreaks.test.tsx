import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WinStreaks from './WinStreaks';
import * as api from '../../api';

// Mock the API module
jest.mock('../../api', () => ({
  getWinStreaks: jest.fn(),
}));

describe('WinStreaks Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading state initially', () => {
    // Mock API to return a promise that doesn't resolve immediately
    (api.getWinStreaks as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<WinStreaks />);

    // Verify loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should display win streaks when data is loaded', async () => {
    // Mock API response with sample data
    const mockUsers = [
      { _id: 'user1', name: 'John Doe', highestWinStreak: 10 },
      { _id: 'user2', name: 'Jane Smith', highestWinStreak: 8 },
      { _id: 'user3', name: 'Bob Johnson', highestWinStreak: 5 },
    ];

    (api.getWinStreaks as jest.Mock).mockResolvedValue({ data: mockUsers });

    render(<WinStreaks />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify header
    expect(screen.getByText('Top 10 Win Streaks')).toBeInTheDocument();

    // Verify table headers
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Highest Win Streak')).toBeInTheDocument();

    // Verify user data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Verify win streak numbers
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Verify rankings (1, 2, 3)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('should display message when no win streaks are found', async () => {
    // Mock API response with empty data
    (api.getWinStreaks as jest.Mock).mockResolvedValue({ data: [] });

    render(<WinStreaks />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify empty state message
    expect(screen.getByText('No win streaks found')).toBeInTheDocument();
  });

  test('should handle API error', async () => {
    // Mock API to throw an error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (api.getWinStreaks as jest.Mock).mockRejectedValue(new Error('API error'));

    render(<WinStreaks />);

    // Wait for the error to be handled
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify console error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching win streaks:',
      expect.any(Error)
    );

    // Verify empty state is shown
    expect(screen.getByText('No win streaks found')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
