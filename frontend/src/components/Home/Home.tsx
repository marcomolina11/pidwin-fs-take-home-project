import React from 'react';
import { Container, Grow, Paper, Typography } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { UserData } from '../../types/actionTypes';

const Home: React.FC = () => {
  // Checking if the user is logged in by checking the localStorage is done the same way in all components (Login, Home, etc.)
  // TODO: Refactor this to a custom hook
  let user: UserData | null = null;

  try {
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      if (profile?.token) {
        user = jwtDecode<UserData>(profile.token);
      }
    }
  } catch (error) {
    console.error('Error parsing profile from localStorage:', error);
    user = null;
  }

  return (
    <Grow in>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3}>
          {user !== null ? (
            <Typography variant="h4" align="center" color="primary">
              {`Welcome ${user.name}`}
            </Typography>
          ) : (
            <Typography variant="h4" align="center" color="primary">
              Login to Play
            </Typography>
          )}
        </Paper>
      </Container>
    </Grow>
  );
};

export default Home;
