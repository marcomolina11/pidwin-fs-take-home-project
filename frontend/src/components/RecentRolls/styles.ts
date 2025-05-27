import { SxProps, Theme } from '@mui/material';

interface StylesInterface {
  container: SxProps<Theme>;
}

export const styles: StylesInterface = {
  container: {
    padding: 0,
    width: '280px',
    margin: 0,
    flexShrink: 0,
  },
};
