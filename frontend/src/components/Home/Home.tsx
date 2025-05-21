import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { UserData } from '../../types/actionTypes';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import GameForm from '../GameForm/GameForm';

const Home: React.FC = () => {
  const user: UserData | null = useSelector(selectUser);

  return (
    <div>
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
        <GameForm />
      </Container>
    </div>
  );
};

export default Home;
