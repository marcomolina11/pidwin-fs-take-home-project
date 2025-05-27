import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { styles } from './styles';
import { UserData } from '../../types';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import GameForm from '../GameForm/GameForm';
import RecentRolls from '../RecentRolls/RecentRolls';
import NextRollCountdown from '../NextRollCountdown/NextRollCountdown';
import BetStatus from '../BetStatus/BetStatus';

const Home: React.FC = () => {
  const user: UserData | null = useSelector(selectUser);

  return (
    <div>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={styles.paper}>
          {user !== null ? (
            <>
              <Typography variant="h4" align="center" color="primary">
                {`Welcome ${user.name}`}
              </Typography>
              <BetStatus />
            </>
          ) : (
            <Typography variant="h4" align="center" color="primary">
              Login to Play
            </Typography>
          )}
        </Paper>
      </Container>
      {user !== null && (
        <Box sx={styles.gameContainer}>
          <Box sx={styles.game}>
            <RecentRolls />
            <GameForm />
            <NextRollCountdown />
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Home;
