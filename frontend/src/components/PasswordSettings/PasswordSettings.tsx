import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import Input from '../Login/Input';
import { styles } from './styles';
import LockIcon from '@mui/icons-material/LockRounded';
import { changePassword } from '../../actions/login';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PasswordChangeFormData } from '../../types/actionTypes';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectUser,
} from '../../selectors/authSelectors';

const PasswordSetting: React.FC = () => {
  const user = useSelector(selectUser);
  const isSingedIn = useSelector(selectIsAuthenticated);
  const history = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [changeFormData, setChangeFormData] = useState<PasswordChangeFormData>({
    oldPassword: '',
    newPassword: '',
    email: user !== null ? user.email : '',
  });

  // Use ThunkDispatch instead of regular Dispatch
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();

  const handleChangeC = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangeFormData({ ...changeFormData, [e.target.name]: e.target.value });
  };

  const handleShowPassword = () => {
    setShowPassword((prevPassword) => !prevPassword);
  };

  const handleSubmitChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(changePassword(changeFormData, history));
  };

  useEffect(() => {
    if (!isSingedIn) {
      history('/');
    }
  }, [isSingedIn, history]);

  return (
    <div>
      <Container component="main" maxWidth="xs">
        <Paper sx={styles.paper} elevation={3}>
          <Avatar sx={styles.avatar}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5" color="primary">
            Set Password
          </Typography>
          <form style={styles.form} onSubmit={handleSubmitChange}>
            <Grid container spacing={2}>
              <Typography
                variant="caption"
                color="error"
                sx={styles.typo}
                align="left"
              >
                To change your password, enter your current password and your
                new password.
              </Typography>
              <Input
                name="oldPassword"
                label="Current Password"
                handleChange={handleChangeC}
                type={showPassword ? 'text' : 'password'}
                handleShowPassword={handleShowPassword}
              />
              <Input
                name="newPassword"
                label="New Password"
                handleChange={handleChangeC}
                type="password"
                showBar={true}
                passValue={changeFormData.newPassword}
              />
              <Button
                type="submit"
                sx={styles.submit}
                fullWidth
                variant="contained"
                color="primary"
              >
                Change Password
              </Button>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default PasswordSetting;
