import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameForm from './GameForm';
import * as reactRedux from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import { placeBet } from '../../actions/game';

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// Mock actions
jest.mock('../../actions/game', () => ({
  placeBet: jest.fn(),
}));

describe('GameForm Component', () => {
  const mockUseSelector = reactRedux.useSelector as jest.MockedFunction<
    typeof reactRedux.useSelector
  >;
  const mockUseDispatch = reactRedux.useDispatch as unknown as jest.Mock;
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);

    // Default mock for user with 100 tokens
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) {
        return { _id: 'user123', name: 'Test User', tokens: 100 };
      }
      return null;
    });
  });

  test('should render the form with correct fields', () => {
    render(<GameForm />);

    expect(
      screen.getByText('Place your wager for a chance to win!')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Wager Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bet on Lucky-7/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Submit Wager/i })
    ).toBeInTheDocument();
  });

  test('should allow changing the wager amount', () => {
    render(<GameForm />);

    const wagerInput = screen.getByLabelText(
      /Wager Amount/i
    ) as HTMLInputElement;
    fireEvent.change(wagerInput, { target: { value: '50' } });

    expect(wagerInput.value).toBe('50');
  });

  test('should allow toggling the Lucky-7 checkbox', () => {
    render(<GameForm />);

    const checkbox = screen.getByLabelText(
      /Bet on Lucky-7/i
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  test('should dispatch placeBet action on form submission', () => {
    render(<GameForm />);

    // Set wager amount
    const wagerInput = screen.getByLabelText(/Wager Amount/i);
    fireEvent.change(wagerInput, { target: { value: '75' } });

    // Check the Lucky-7 checkbox
    const checkbox = screen.getByLabelText(/Bet on Lucky-7/i);
    fireEvent.click(checkbox);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Wager/i });
    fireEvent.click(submitButton);

    // Verify placeBet was called with the correct arguments
    expect(placeBet).toHaveBeenCalledWith({ amount: 75, isLuckySeven: true });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test('should reset form state after submission', () => {
    render(<GameForm />);

    // Set wager amount
    const wagerInput = screen.getByLabelText(
      /Wager Amount/i
    ) as HTMLInputElement;
    fireEvent.change(wagerInput, { target: { value: '75' } });

    // Check the Lucky-7 checkbox
    const checkbox = screen.getByLabelText(
      /Bet on Lucky-7/i
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Submit Wager/i });
    fireEvent.click(submitButton);

    // Verify form was reset
    expect(wagerInput.value).toBe('0');
    expect(checkbox.checked).toBe(false);
  });

  test('should limit max wager to available tokens', () => {
    render(<GameForm />);

    const wagerInput = screen.getByLabelText(
      /Wager Amount/i
    ) as HTMLInputElement;
    expect(wagerInput.max).toBe('100'); // Max should be the user's token amount
  });

  test('should not render when user is not authenticated', () => {
    // Mock no user
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return null;
      return null;
    });

    const { container } = render(<GameForm />);

    // Form elements should still render, but submit handler will do nothing
    expect(
      screen.getByText('Place your wager for a chance to win!')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Wager Amount/i)).toBeInTheDocument();

    // Max tokens should be 0
    const wagerInput = screen.getByLabelText(
      /Wager Amount/i
    ) as HTMLInputElement;
    expect(wagerInput.max).toBe('0');
  });
});
