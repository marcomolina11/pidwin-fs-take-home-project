import { SxProps, Theme } from '@mui/material';

interface StylesInterface {
  paper: SxProps<Theme>;
}

export const styles: StylesInterface = {
  paper: {
    textAlign: 'center',
    padding: '16px',
    minWidth: '522px',
  },
};
