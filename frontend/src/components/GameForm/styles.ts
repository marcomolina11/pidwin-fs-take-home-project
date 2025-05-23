import { SxProps, Theme } from '@mui/material';

interface StylesInterface {
  paper: SxProps<Theme>;
}

export const styles: StylesInterface = {
  paper: {
    textAlign: 'center',
    padding: '16px',
    width: '520px',
    flexShrink: 0,
  },
};
