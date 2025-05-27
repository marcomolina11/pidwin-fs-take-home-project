import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';
import * as reactRedux from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import * as actionTypes from '../../constants/actionTypes';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe('Navbar Component', () => {
  const mockUseSelector = reactRedux.useSelector as jest.MockedFunction<
    typeof reactRedux.useSelector
  >;
  const mockDispatch = jest.fn();
  const mockUseDispatch = reactRedux.useDispatch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);

    // Reset mocks
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  // Helper function to render with Router
  const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('should render navbar with logo and links when not logged in', () => {
    // Mock no user
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return null;
      return undefined;
    });

    renderWithRouter(<Navbar />);

    // Check logo and app name
    expect(screen.getByText('Lucky-7')).toBeInTheDocument();

    // Check navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Win Streaks')).toBeInTheDocument();

    // Check login button is shown
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Profile elements should not be present
    expect(screen.queryByText(/Tokens:/)).not.toBeInTheDocument();
  });

  test('should render user profile when logged in', () => {
    // Mock authenticated user
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      tokens: 100,
      picture: '',
      exp: Date.now() / 1000 + 3600, // expires in 1 hour
    };

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      return undefined;
    });

    renderWithRouter(<Navbar />);

    // Check user info is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Tokens: 100')).toBeInTheDocument();

    // Check avatar with initials
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();

    // Check logout button
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Set Password')).toBeInTheDocument();

    // Login button should not be present
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  test('should display first initial when user has only one name', () => {
    // Mock user with single name
    const mockUser = {
      _id: 'user123',
      name: 'John',
      tokens: 100,
      picture: '',
      exp: Date.now() / 1000 + 3600,
    };

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      return undefined;
    });

    renderWithRouter(<Navbar />);

    // Check avatar has single initial
    const avatar = screen.getByText('J');
    expect(avatar).toBeInTheDocument();
  });

  test('should handle logout when button is clicked', () => {
    // Mock authenticated user
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      tokens: 100,
      picture: '',
      exp: Date.now() / 1000 + 3600,
    };

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      return undefined;
    });

    renderWithRouter(<Navbar />);

    // Click logout button
    fireEvent.click(screen.getByText('Logout'));

    // Check if dispatch was called with logout action
    expect(mockDispatch).toHaveBeenCalledWith({ type: actionTypes.LOGOUT });

    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  test('should navigate to password page when Set Password is clicked', () => {
    // Mock authenticated user
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      tokens: 100,
      picture: '',
      exp: Date.now() / 1000 + 3600,
    };

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      return undefined;
    });

    renderWithRouter(<Navbar />);

    // Click Set Password button
    fireEvent.click(screen.getByText('Set Password'));

    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith('/password');
  });

  test('should auto-logout when token is expired', () => {
    // Mock user with expired token
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      tokens: 100,
      picture: '',
      exp: Date.now() / 1000 - 3600, // expired 1 hour ago
    };

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return mockUser;
      return undefined;
    });

    renderWithRouter(<Navbar />);

    // Should automatically call logout
    expect(mockDispatch).toHaveBeenCalledWith({ type: actionTypes.LOGOUT });
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  test('should animate token display when token value changes', () => {
    // Mock initial user state
    const initialUser = {
      _id: 'user123',
      name: 'John Doe',
      tokens: 100,
      picture: '',
      exp: Date.now() / 1000 + 3600,
    };

    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return initialUser;
      return undefined;
    });

    renderWithRouter(<Navbar />);

    // First render with initial token value
    const tokenText = screen.getByText('Tokens: 100');

    // Change user token value
    const updatedUser = {
      ...initialUser,
      tokens: 150,
    };

    // Update the mock to return the new user
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectUser) return updatedUser;
      return undefined;
    });

    // Force a re-render to trigger the effect
    renderWithRouter(<Navbar />);

    // Tokens display should be updated and animation started
    expect(screen.getByText('Tokens: 150')).toBeInTheDocument();

    // After animation timeout, it should return to normal (we could test this with jest fake timers)
    act(() => {
      jest.advanceTimersByTime(700);
    });
  });
});
