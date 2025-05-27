import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NextRollCountdown from './NextRollCountdown';
import * as reactRedux from 'react-redux';
import { selectCurrentGame } from '../../selectors/gameSelectors';
import { GAME_TIME_INTERVAL } from '../../constants';

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('NextRollCountdown Component', () => {
  const mockUseSelector = reactRedux.useSelector as jest.MockedFunction<
    typeof reactRedux.useSelector
  >;

  // Mock Date.now for consistent testing
  const originalDateNow = Date.now;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original Date.now
    global.Date.now = originalDateNow;
  });

  test('should show loading state when no game data available', () => {
    // Mock no current game
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectCurrentGame) return null;
      return undefined;
    });

    render(<NextRollCountdown />);

    expect(screen.getByText('Next Roll')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument(); // No number displayed
  });

  test('should calculate and display correct time remaining', () => {
    // Set up a fixed "now" time
    const fixedNow = 1620000000000; // May 3, 2021
    global.Date.now = jest.fn(() => fixedNow);

    // Game created 10 seconds ago (with 20 seconds remaining in a 30-second cycle)
    const gameCreatedAt = new Date(fixedNow - 10000).toISOString();
    const expectedSecondsLeft = (GAME_TIME_INTERVAL - 10000) / 1000;

    // Mock current game data
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectCurrentGame) {
        return {
          _id: 'game123',
          createdAt: gameCreatedAt,
          isComplete: false,
        };
      }
      return undefined;
    });

    render(<NextRollCountdown />);

    expect(screen.getByText('Next Roll In')).toBeInTheDocument();
    expect(
      screen.getByText(expectedSecondsLeft.toString())
    ).toBeInTheDocument();
    expect(screen.getByText('seconds')).toBeInTheDocument();
  });

  test('should display 0 when time has expired', () => {
    // Set up a fixed "now" time
    const fixedNow = 1620000000000;
    global.Date.now = jest.fn(() => fixedNow);

    // Game created long ago (time already expired)
    const gameCreatedAt = new Date(
      fixedNow - GAME_TIME_INTERVAL - 5000
    ).toISOString();

    // Mock current game data
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectCurrentGame) {
        return {
          _id: 'game123',
          createdAt: gameCreatedAt,
          isComplete: false,
        };
      }
      return undefined;
    });

    render(<NextRollCountdown />);

    expect(screen.getByText('Next Roll In')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('should update countdown timer every second', () => {
    // Setup jest fake timers
    jest.useFakeTimers();

    // Set up a fixed initial time
    let currentTime = 1620000000000;
    global.Date.now = jest.fn(() => currentTime);

    // Game created 10 seconds ago with 20 seconds remaining (assuming 30s interval)
    const gameCreatedAt = new Date(currentTime - 10000).toISOString();

    // Mock current game data
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectCurrentGame) {
        return {
          _id: 'game123',
          createdAt: gameCreatedAt,
          isComplete: false,
        };
      }
      return undefined;
    });

    render(<NextRollCountdown />);

    // Initial state should show 20 seconds (GAME_TIME_INTERVAL/1000 - 10)
    const initialSecondsLeft = Math.floor((GAME_TIME_INTERVAL - 10000) / 1000);
    expect(screen.getByText(initialSecondsLeft.toString())).toBeInTheDocument();

    // Now advance both the timer and our mock Date.now
    act(() => {
      currentTime += 1000; // Advance current time by 1 second
      global.Date.now = jest.fn(() => currentTime); // Update the mock
      jest.advanceTimersByTime(1000); // Advance timers
    });

    // After 1 second, timer should show 19 seconds left
    expect(
      screen.getByText((initialSecondsLeft - 1).toString())
    ).toBeInTheDocument();

    // Advance time by 2 more seconds
    act(() => {
      currentTime += 2000; // Advance current time by 2 more seconds
      global.Date.now = jest.fn(() => currentTime); // Update the mock
      jest.advanceTimersByTime(2000); // Advance timers
    });

    // After 3 seconds total, timer should show 17 seconds left
    expect(
      screen.getByText((initialSecondsLeft - 3).toString())
    ).toBeInTheDocument();

    // Clean up
    jest.useRealTimers();
  });

  test('should show error color when less than 5 seconds remaining', () => {
    // Set up a fixed "now" time
    const fixedNow = 1620000000000;
    global.Date.now = jest.fn(() => fixedNow);

    // Game with only 4 seconds remaining
    const gameCreatedAt = new Date(
      fixedNow - (GAME_TIME_INTERVAL - 4000)
    ).toISOString();

    // Mock current game data
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectCurrentGame) {
        return {
          _id: 'game123',
          createdAt: gameCreatedAt,
          isComplete: false,
        };
      }
      return undefined;
    });

    render(<NextRollCountdown />);

    // Find CircularProgress and check its color prop
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toHaveClass('MuiCircularProgress-colorError');
  });
});
