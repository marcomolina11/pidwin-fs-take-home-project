import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BetStatus from './BetStatus';
import * as reactRedux from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import {
  selectRecentRolls,
  selectHasActiveBet,
} from '../../selectors/gameSelectors';

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe('BetStatus Component', () => {
  const mockUseSelector = reactRedux.useSelector as jest.MockedFunction<
    typeof reactRedux.useSelector
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render nothing when user is not authenticated', () => {
    // Mock no user
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return null;
      if (selector === selectRecentRolls) return [];
      if (selector === selectHasActiveBet) return false;
      return undefined;
    });

    const { container } = render(<BetStatus />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should show "bet placed" message when user has active bet', () => {
    // Mock user with active bet
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return { _id: 'user123', name: 'Test User' };
      if (selector === selectRecentRolls) return [];
      if (selector === selectHasActiveBet) return true;
      return undefined;
    });

    render(<BetStatus />);
    expect(
      screen.getByText('Bet placed, awaiting result...')
    ).toBeInTheDocument();
  });

  test('should show winning message when user won last roll', () => {
    // Mock user with winning result
    const mockRecentRolls = [
      {
        id: 'game1',
        dice1: 3,
        dice2: 4,
        rollResult: 7,
        userResults: {
          user123: { userId: 'user123', result: 'win' },
        },
      },
    ];

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return { _id: 'user123', name: 'Test User' };
      if (selector === selectRecentRolls) return mockRecentRolls;
      if (selector === selectHasActiveBet) return false;
      return undefined;
    });

    render(<BetStatus />);
    expect(screen.getByText('You Won! Congratulations!')).toBeInTheDocument();
  });

  test('should show losing message when user lost last roll', () => {
    // Mock user with losing result
    const mockRecentRolls = [
      {
        id: 'game1',
        dice1: 2,
        dice2: 3,
        rollResult: 5,
        userResults: {
          user123: { userId: 'user123', result: 'lose' },
        },
      },
    ];

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return { _id: 'user123', name: 'Test User' };
      if (selector === selectRecentRolls) return mockRecentRolls;
      if (selector === selectHasActiveBet) return false;
      return undefined;
    });

    render(<BetStatus />);
    expect(
      screen.getByText('You Lost! Better luck next time')
    ).toBeInTheDocument();
  });

  test('should show default message when user has no active bet or recent results', () => {
    // Mock authenticated user with no bets
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return { _id: 'user123', name: 'Test User' };
      if (selector === selectRecentRolls) return [];
      if (selector === selectHasActiveBet) return false;
      return undefined;
    });

    render(<BetStatus />);
    expect(screen.getByText("You haven't placed a bet")).toBeInTheDocument();
  });

  test('should show default message when no user result in latest game', () => {
    // Mock recent roll but with no result for current user
    const mockRecentRolls = [
      {
        id: 'game1',
        dice1: 3,
        dice2: 4,
        rollResult: 7,
        userResults: {
          otherUser: { userId: 'otherUser', result: 'win' },
        },
      },
    ];

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return { _id: 'user123', name: 'Test User' };
      if (selector === selectRecentRolls) return mockRecentRolls;
      if (selector === selectHasActiveBet) return false;
      return undefined;
    });

    render(<BetStatus />);
    expect(screen.getByText("You haven't placed a bet")).toBeInTheDocument();
  });
});
