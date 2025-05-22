import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { styles } from './styles';
import { UserData } from '../../types';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import GameForm from '../GameForm/GameForm';
import RecentRolls from '../RecentRolls/RecentRolls';

const Home: React.FC = () => {
  const user: UserData | null = useSelector(selectUser);

  return (
    <div>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={styles.paper}>
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
      <Container sx={styles.game} maxWidth={false} disableGutters>
        {user !== null && <RecentRolls />}
        {user !== null && <GameForm />}
        {user !== null && <RecentRolls />}
      </Container>
    </div>
  );
};

export default Home;
