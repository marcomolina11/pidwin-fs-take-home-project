import { SxProps, Theme } from '@mui/material';
import { theme } from '../../themes/Default';
import { deepPurple } from '@mui/material/colors';

interface StylesInterface {
  appBar: SxProps<Theme>;
  heading: SxProps<Theme>;
  toolbar: SxProps<Theme>;
  profile: React.CSSProperties;
  userName: SxProps<Theme>;
  brandContainer: React.CSSProperties;
  purple: SxProps<Theme>;
  paper: SxProps<Theme>;
  game: SxProps<Theme>;
  gameContainer: SxProps<Theme>;
}

export const styles: StylesInterface = {
  appBar: {
    borderRadius: 15,
    margin: '30px 0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 50px',
  },
  heading: {
    color: 'rgba(0,183,255, 1)',
    textDecoration: 'none',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '1000px',
  },
  profile: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '400px',
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  paper: {
    margin: '30px 0',
    textAlign: 'center',
    padding: '10px 20px',
  },
  game: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    paddingLeft: 0,
    paddingRight: 0,
    maxWidth: '100%',
    margin: 0,
  },
  gameContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    mt: 2,
  },
};
