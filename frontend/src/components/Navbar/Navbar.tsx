import React, { useCallback, useEffect } from 'react';
import { AppBar, Typography, Toolbar, Avatar, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as actionType from '../../constants/actionTypes';
import { styles } from './styles';
import { UserData } from '../../types/actionTypes';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';

const Navbar: React.FC = () => {
  const user: UserData | null = useSelector(selectUser);

  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  const history = useNavigate();

  const logout = useCallback(() => {
    dispatch({ type: actionType.LOGOUT });
    history('/auth');
  }, [dispatch, history]);

  useEffect(() => {
    if (user !== null) {
      if (user.exp && user.exp * 1000 < new Date().getTime()) logout();
    }
  }, [user, logout]);

  return (
    <AppBar sx={styles.appBar} position="static" color="inherit">
      <div style={styles.brandContainer}>
        <Typography
          component={Link}
          to="/"
          sx={styles.heading}
          variant="h5"
          align="center"
        >
          CoinToss
        </Typography>
      </div>
      <Toolbar sx={styles.toolbar}>
        {user !== null ? (
          <div style={styles.profile}>
            <Typography sx={styles.userName} variant="h6">
              {`Tokens: ${user.tokens}`}
            </Typography>
            <Avatar sx={styles.purple} alt={user.name} src={user.picture}>
              {user.name.charAt(0)}
            </Avatar>
            <Typography sx={styles.userName} variant="h6">
              {user.name}
            </Typography>
            <Button
              variant="contained"
              sx={styles.logout}
              color="secondary"
              onClick={logout}
            >
              Logout
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                history('/password');
              }}
            >
              Set Password
            </Button>
          </div>
        ) : (
          <Button
            component={Link}
            to="/auth"
            variant="contained"
            color="primary"
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
