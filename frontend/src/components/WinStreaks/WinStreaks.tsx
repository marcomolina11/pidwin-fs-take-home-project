import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import * as api from '../../api';
import { styles } from './styles';

interface UserStreak {
  _id: string;
  name: string;
  highestWinStreak: number;
}

const WinStreaks: React.FC = () => {
  const [topUsers, setTopUsers] = useState<UserStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinStreaks = async () => {
      try {
        const { data } = await api.getWinStreaks();
        setTopUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching win streaks:', error);
        setLoading(false);
      }
    };

    fetchWinStreaks();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={styles.paper}>
        <Typography variant="h4" align="center" color="primary">
          Top 10 Win Streaks
        </Typography>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align="right">Highest Win Streak</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topUsers.length > 0 ? (
              topUsers.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell align="right">{user.highestWinStreak}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No win streaks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default WinStreaks;
