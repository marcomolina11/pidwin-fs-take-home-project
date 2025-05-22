import React from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import { selectRecentRolls } from '../../selectors/gameSelectors';
import { styles } from './styles';
import { GameResult } from '../../types/actionTypes';

const RecentRolls: React.FC = () => {
  const user = useSelector(selectUser);
  const gameResults = useSelector(selectRecentRolls);

  // Get the user's result for a game
  const getUserResult = (result: GameResult) => {
    if (!user || !result.userResults) return 'No Bet';

    const userResult = result.userResults[user._id];
    if (!userResult) return 'No Bet';

    return userResult.result;
  };

  return (
    <Container sx={styles.container} maxWidth={false} disableGutters>
      <TableContainer component={Paper}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Recent Rolls
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Die 1</TableCell>
              <TableCell>Die 2</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Your Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gameResults.length > 0 ? (
              gameResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.dice1}</TableCell>
                  <TableCell>{result.dice2}</TableCell>
                  <TableCell
                    sx={{
                      color:
                        result.rollResult === 7 ? 'primary.main' : 'inherit',
                      fontWeight: result.rollResult === 7 ? 'bold' : 'normal',
                    }}
                  >
                    {result.rollResult}
                  </TableCell>
                  <TableCell>
                    {getUserResult(result) === 'win' ? (
                      <Chip label="Win" color="success" variant="outlined" />
                    ) : getUserResult(result) === 'lose' ? (
                      <Chip label="Loss" color="error" variant="outlined" />
                    ) : (
                      <Chip label="No Bet" color="default" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No recent rolls yet. Wait for the next game cycle!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RecentRolls;
