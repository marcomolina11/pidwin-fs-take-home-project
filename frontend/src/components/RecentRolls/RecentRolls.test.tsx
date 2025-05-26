import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentRolls from './RecentRolls';
import * as reactRedux from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import { selectRecentRolls } from '../../selectors/gameSelectors';

// Mock the redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

// Mock the selectors
jest.mock('../../selectors/authSelectors', () => ({
  selectUser: jest.fn(),
}));

jest.mock('../../selectors/gameSelectors', () => ({
  selectRecentRolls: jest.fn(),
}));

describe('RecentRolls Component', () => {
  const mockUseSelector = reactRedux.useSelector as jest.MockedFunction<
    typeof reactRedux.useSelector
  >;

  beforeEach(() => {
    mockUseSelector.mockClear();
  });

  test('should display "No recent rolls" message when no game results are available', () => {
    // Mock selectors to return no game results
    mockUseSelector.mockImplementation((selector) => {
      // Better comparison using the function identity
      if (selector.name === 'selectUser' || selector === selectUser)
        return { _id: 'user123', name: 'Test User' };
      if (
        selector.name === 'selectRecentRolls' ||
        selector === selectRecentRolls
      )
        return [];
      return null;
    });

    render(<RecentRolls />);

    expect(screen.getByText('Recent Rolls')).toBeInTheDocument();
    expect(
      screen.getByText('No recent rolls yet. Wait for the next game cycle!')
    ).toBeInTheDocument();
  });

  test('should correctly render game results when available', () => {
    // Mock user
    const mockUser = { _id: 'user123', name: 'Test User' };

    // Mock game results
    const mockResults = [
      {
        id: 'game1',
        dice1: 3,
        dice2: 4,
        rollResult: 7,
        userResults: {
          user123: { userId: 'user123', result: 'win' },
        },
      },
      {
        id: 'game2',
        dice1: 2,
        dice2: 5,
        rollResult: 7,
        userResults: {
          user123: { userId: 'user123', result: 'lose' },
        },
      },
      {
        id: 'game3',
        dice1: 1,
        dice2: 2,
        rollResult: 3,
        userResults: {}, // User didn't bet on this game
      },
    ];

    // Setup mock implementation
    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'selectUser' || selector === selectUser)
        return mockUser;
      if (
        selector.name === 'selectRecentRolls' ||
        selector === selectRecentRolls
      )
        return mockResults;
      return null;
    });

    render(<RecentRolls />);

    // Check headers
    expect(screen.getByText('Recent Rolls')).toBeInTheDocument();
    expect(screen.getByText('Die 1')).toBeInTheDocument();
    expect(screen.getByText('Die 2')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Your Result')).toBeInTheDocument();

    // Check dice values - using more specific queries
    // First game row
    const rows = screen.getAllByRole('row');

    // Row indexing: 0 is header row, 1-3 are data rows
    const firstGameRow = rows[1] as HTMLTableRowElement;
    const secondGameRow = rows[2] as HTMLTableRowElement;
    const thirdGameRow = rows[3] as HTMLTableRowElement;

    // Now TypeScript knows these have cells property
    expect(firstGameRow.cells[0]).toHaveTextContent('3');
    expect(firstGameRow.cells[1]).toHaveTextContent('4');
    expect(firstGameRow.cells[2]).toHaveTextContent('7');
    expect(firstGameRow).toHaveTextContent('Win');

    // Check second game
    expect(secondGameRow.cells[0]).toHaveTextContent('2');
    expect(secondGameRow.cells[1]).toHaveTextContent('5');
    expect(secondGameRow.cells[2]).toHaveTextContent('7');
    expect(secondGameRow).toHaveTextContent('Loss');

    // Check third game
    expect(thirdGameRow.cells[0]).toHaveTextContent('1');
    expect(thirdGameRow.cells[1]).toHaveTextContent('2');
    expect(thirdGameRow.cells[2]).toHaveTextContent('3');
    expect(thirdGameRow).toHaveTextContent('No Bet');

    // Alternative: verify by role
    expect(screen.getByRole('cell', { name: 'Win' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Loss' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'No Bet' })).toBeInTheDocument();
  });

  test('should handle case when user is not authenticated', () => {
    // Mock no user and empty results
    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'selectUser' || selector === selectUser)
        return null;
      if (
        selector.name === 'selectRecentRolls' ||
        selector === selectRecentRolls
      )
        return [
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
      return null;
    });

    render(<RecentRolls />);

    // Should still render the table, but with "No Bet" for results
    expect(screen.getByText('Recent Rolls')).toBeInTheDocument();
    expect(screen.getByText('No Bet')).toBeInTheDocument();
  });
});
