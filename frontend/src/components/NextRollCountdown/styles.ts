import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    p: 2,
    textAlign: 'center',
    width: '280px',
    flexShrink: 0,
  },
  progressBox: {
    position: 'relative',
    display: 'inline-flex',
    mt: 5,
    mb: 5,
  },
  timeLeftBox: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
