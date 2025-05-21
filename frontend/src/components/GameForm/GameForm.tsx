import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import { UserData } from '../../types/actionTypes';

const GameForm: React.FC = () => {
  const user: UserData | null = useSelector(selectUser);
  const [wager, setWager] = useState<number | string>(0);
  const [isLucky, setIsLucky] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setWager(e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLucky(e.target.checked);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //validate inputs

    //make api call with wager amount, isLucky, and the user
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        onSubmit={(e) => handleSubmit(e)}
      >
        <Typography align="center" color="primary">
          Place your wager for a chance to win!
        </Typography>

        <TextField
          label="Wager Amount"
          type="number"
          required
          fullWidth
          inputProps={{
            min: 1,
            max: user?.tokens || 0,
          }}
          onChange={(e) => handleChange(e)}
          value={wager}
        />

        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={isLucky}
              onChange={(e) => handleCheckboxChange(e)}
            />
          }
          label="Bet on Lucky-7"
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Submit Wager
        </Button>
      </Box>
    </Paper>
  );
};
export default GameForm;
