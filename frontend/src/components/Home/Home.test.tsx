import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';
import * as reactRedux from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';

// Mock the child components
jest.mock('../GameForm/GameForm', () => ({
  __esModule: true,
  default: () => <div data-testid="game-form">Game Form Component</div>,
}));

jest.mock('../RecentRolls/RecentRolls', () => ({
  __esModule: true,
  default: () => <div data-testid="recent-rolls">Recent Rolls Component</div>,
}));

jest.mock('../NextRollCountdown/NextRollCountdown', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="next-roll-countdown">Next Roll Countdown Component</div>
  ),
}));

jest.mock('../BetStatus/BetStatus', () => ({
  __esModule: true,
  default: () => <div data-testid="bet-status">Bet Status Component</div>,
}));

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('Home Component', () => {
  const mockUseSelector = reactRedux.useSelector as jest.MockedFunction<
    typeof reactRedux.useSelector
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show login message when user is not authenticated', () => {
    // Mock no user
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return null;
      return undefined;
    });

    render(<Home />);

    // Should show login message
    expect(screen.getByText('Login to Play')).toBeInTheDocument();

    // Child components that require authentication should not be present
    expect(screen.queryByTestId('game-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('recent-rolls')).not.toBeInTheDocument();
    expect(screen.queryByTestId('next-roll-countdown')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bet-status')).not.toBeInTheDocument();
  });

  test('should show welcome message and game components when user is authenticated', () => {
    // Mock authenticated user
    const mockUser = { _id: 'user123', name: 'John Doe', tokens: 100 };
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      return undefined;
    });

    render(<Home />);

    // Should show welcome message with user name
    expect(screen.getByText('Welcome John Doe')).toBeInTheDocument();

    // All game components should be present
    expect(screen.getByTestId('game-form')).toBeInTheDocument();
    expect(screen.getByTestId('recent-rolls')).toBeInTheDocument();
    expect(screen.getByTestId('next-roll-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('bet-status')).toBeInTheDocument();
  });

  test('should handle user with empty name', () => {
    // Mock authenticated user with empty name
    const mockUser = { _id: 'user123', name: '', tokens: 100 };
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      return undefined;
    });

    render(<Home />);

    // Should still show welcome message
    expect(screen.getByText('Welcome')).toBeInTheDocument();

    // All game components should be present
    expect(screen.getByTestId('game-form')).toBeInTheDocument();
    expect(screen.getByTestId('recent-rolls')).toBeInTheDocument();
    expect(screen.getByTestId('next-roll-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('bet-status')).toBeInTheDocument();
  });
});
