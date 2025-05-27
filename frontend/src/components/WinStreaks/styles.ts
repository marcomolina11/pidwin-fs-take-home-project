import { SxProps, Theme } from '@mui/material';

interface StylesInterface {
  paper: SxProps<Theme>;
}

export const styles: StylesInterface = {
  paper: {
    margin: '30px 0',
    textAlign: 'center',
    padding: '10px 20px',
  },
};
