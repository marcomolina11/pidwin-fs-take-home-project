import React from 'react';
import {
  Avatar,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import Input from '../Login/Input';
import { UserData } from '../../types/actionTypes';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';

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
        <Paper sx={styles.paper} elevation={3}>
          <Avatar sx={styles.avatar}>
            <CasinoIcon />
          </Avatar>
          <Typography variant="h5" color="primary">
            Lucky 7
          </Typography>
          <form style={styles.form} onSubmit={() => {}}>
            <Grid container spacing={2}>
              <Typography
                variant="caption"
                color="info"
                sx={styles.typo}
                align="center"
              >
                Set your wager for a chance to win!
              </Typography>
              <Input
                name="wager"
                label="Your Wager"
                handleChange={() => {}}
                type="number"
              />
              <Button
                type="submit"
                sx={styles.submit}
                fullWidth
                variant="contained"
                color="primary"
              >
                Submit Wager
              </Button>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Home;
