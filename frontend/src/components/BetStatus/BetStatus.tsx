import React from 'react';
import { Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';
import {
  selectRecentRolls,
  selectHasActiveBet,
} from '../../selectors/gameSelectors';

const BetStatus: React.FC = () => {
  const user = useSelector(selectUser);
  const recentRolls = useSelector(selectRecentRolls);
  const hasActiveBet = useSelector(selectHasActiveBet);

  if (!user || !user._id) return null;

  // Show "bet placed" message if there's an active bet
  if (hasActiveBet) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 2 }}>
        Bet placed, awaiting result...
      </Typography>
    );
  }

  // Show win/lose result if available
  const latestResult =
    recentRolls && recentRolls.length > 0 ? recentRolls[0] : null;
  const userResult = latestResult?.userResults?.[user._id];

  if (userResult) {
    if (userResult.result === 'win') {
      return (
        <Typography
          variant="h6"
          align="center"
          color="success.main"
          sx={{ mt: 2 }}
        >
          You Won! Congratulations!
        </Typography>
      );
    } else if (userResult.result === 'lose') {
      return (
        <Typography
          variant="h6"
          align="center"
          color="error.main"
          sx={{ mt: 2 }}
        >
          You Lost! Better luck next time
        </Typography>
      );
    }
  }

  // Default: No bet placed
  return (
    <Typography variant="h6" align="center" sx={{ mt: 2 }}>
      You haven't placed a bet
    </Typography>
  );
};

export default BetStatus;
