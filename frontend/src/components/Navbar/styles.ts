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
  logout?: SxProps<Theme>;
  logo: SxProps<Theme>;
}

export const styles: StylesInterface = {
  appBar: {
    borderRadius: 1,
    margin: '30px 0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0 10px 20px',
  },
  heading: {
    color: 'rgba(0,183,255, 1)',
    textDecoration: 'none',
    textWrap: 'nowrap',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '1000px',
  },
  profile: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
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
  logo: {
    margin: theme.spacing(1),
    marginLeft: 0,
    color: '#9c27b0',
    fontSize: '2.5rem',
  },
};
