import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  AppBar,
  Typography,
  Toolbar,
  Avatar,
  Button,
  Box,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as actionType from '../../constants/actionTypes';
import { styles } from './styles';
import { UserData } from '../../types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';

const Navbar: React.FC = () => {
  const user: UserData | null = useSelector(selectUser);
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  const history = useNavigate();

  // Track previous token value
  const prevTokensRef = useRef<number | null>(null);
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);

  // Check for token changes
  useEffect(() => {
    if (user) {
      // Check if we have a previous value and if tokens have changed
      if (
        prevTokensRef.current !== null &&
        user.tokens !== undefined &&
        user.tokens !== prevTokensRef.current
      ) {
        // Tokens changed, trigger animation
        setIsAnimating(true);

        // Reset animation after duration
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 700);

        return () => clearTimeout(timer);
      }

      // Update reference with current token value
      if (user.tokens !== undefined) {
        prevTokensRef.current = user.tokens;
      }
    }
  }, [user]);

  const logout = useCallback(() => {
    dispatch({ type: actionType.LOGOUT });
    history('/auth');
  }, [dispatch, history]);

  useEffect(() => {
    if (user !== null) {
      if (user.exp && user.exp * 1000 < new Date().getTime()) logout();
    }
  }, [user, logout]);

  // Function to get user initials or placeholder
  const getUserInitials = () => {
    if (!user || !user.name) return '?';

    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  };

  // Token display with animation styles
  const tokenDisplayStyle = {
    ...styles.userName,
    transition: 'all 0.5s ease',
    ...(isAnimating && {
      color: 'secondary.main',
      transform: 'scale(1.1)',
      fontWeight: 'bold',
    }),
  };

  return (
    <AppBar sx={styles.appBar} position="static" color="inherit">
      <div style={styles.brandContainer}>
        <CasinoIcon sx={styles.logo} />
        <Typography
          component={Link}
          to="/"
          sx={styles.heading}
          variant="h5"
          align="center"
        >
          Lucky-7
        </Typography>
      </div>
      <Toolbar sx={styles.toolbar}>
        <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
          <Button component={Link} to="/" variant="outlined" color="primary">
            Home
          </Button>
          <Button
            component={Link}
            to="/winStreaks"
            variant="outlined"
            color="primary"
          >
            Win Streaks
          </Button>
        </Box>
        {user !== null ? (
          <div style={styles.profile}>
            <Typography sx={tokenDisplayStyle} variant="h6">
              {`Tokens: ${user.tokens}`}
            </Typography>
            <Avatar sx={styles.purple} alt={user.name} src={user.picture}>
              {getUserInitials()}
            </Avatar>
            <Typography sx={styles.userName} variant="h6">
              {user.name}
            </Typography>
            <Button
              variant="contained"
              sx={styles.logout}
              color="secondary"
              onClick={logout}
            >
              Logout
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                history('/password');
              }}
            >
              Set Password
            </Button>
          </div>
        ) : (
          <Button
            component={Link}
            to="/auth"
            variant="contained"
            color="primary"
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
