import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentGame } from '../../selectors/gameSelectors';
import { GAME_TIME_INTERVAL } from '../../constants/actionTypes';
import { styles } from './styles';

const NextRollCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);
  const currentGame = useSelector(selectCurrentGame);

  // Calculate time remaining from createdAt to now
  const calculateTimeLeft = (createdAt: string): number => {
    const gameCreationTime = new Date(createdAt).getTime();
    const now = Date.now();
    const elapsedMs = now - gameCreationTime;
    const remainingMs = Math.max(0, GAME_TIME_INTERVAL - elapsedMs);
    return Math.floor(remainingMs / 1000);
  };

  // Initialize timer when component mounts or currentGame changes
  useEffect(() => {
    if (!currentGame?.createdAt) return;

    // Calculate initial time left
    const initialTimeLeft = calculateTimeLeft(currentGame.createdAt);
    setTimeLeft(initialTimeLeft);

    // Calculate initial progress percentage
    setProgress((initialTimeLeft / (GAME_TIME_INTERVAL / 1000)) * 100);

    // Set up interval to update countdown every second
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null || prevTime <= 0) return 0;

        const newTime = prevTime - 1;
        setProgress((newTime / (GAME_TIME_INTERVAL / 1000)) * 100);
        return newTime;
      });
    }, 1000);

    // Clean up interval on unmount or when currentGame changes
    return () => clearInterval(timerInterval);
  }, [currentGame]);

  // If no time data available yet
  if (timeLeft === null) {
    return (
      <Container component={Paper} sx={styles.container}>
        <Typography variant="h6">Next Roll</Typography>
        <CircularProgress sx={{ mt: 6 }} />
      </Container>
    );
  }

  return (
    <Container component={Paper} sx={styles.container} maxWidth={false}>
      <Typography variant="h6">Next Roll In</Typography>
      <Box sx={styles.progressBox}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={130}
          thickness={5}
          color={timeLeft <= 5 ? 'error' : 'primary'}
        />
        <Box sx={styles.timeLeftBox}>
          <Typography variant="h3" component="div" color="text.secondary">
            {timeLeft}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6">seconds</Typography>
    </Container>
  );
};

export default NextRollCountdown;
