import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import Input from './Input';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signup, login } from '../../actions/login';
import LockIcon from '@mui/icons-material/LockOutlined';
import { styles } from './styles';
import { SignupFormData, UserData } from '../../types/actionTypes';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useSelector } from 'react-redux';
import { selectUser } from '../../selectors/authSelectors';

const formDataInitVal: SignupFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Login: React.FC = () => {
  const user: UserData | null = useSelector(selectUser);
  const [formData, setFormData] = useState<SignupFormData>(formDataInitVal);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isExistingUser, setIsExsistingUser] = useState<boolean>(true);

  const history = useNavigate();
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();

  useEffect(() => {
    if (user !== null) {
      history('/');
    }
  }, [user, history]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isExistingUser) {
      dispatch(
        login(
          {
            email: formData.email,
            password: formData.password,
          },
          history
        )
      );
    } else {
      dispatch(signup(formData, history));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShowPassword = () => {
    setShowPassword((prevPassword) => !prevPassword);
  };

  const switchLogin = () => {
    setIsExsistingUser((prevState) => !prevState);
  };

  return (
    <div>
      <Container component="main" maxWidth="xs">
        <Paper sx={styles.paper} elevation={3}>
          <Avatar sx={styles.avatar}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5" color="primary">
            {isExistingUser ? 'Login' : 'Signup'}
          </Typography>
          <form style={styles.form} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {!isExistingUser && (
                <>
                  <Input
                    name="firstName"
                    label="First Name"
                    handleChange={handleChange}
                    autoFocus
                    half
                  />
                  <Input
                    name="lastName"
                    label="Last Name"
                    handleChange={handleChange}
                    half
                  />
                </>
              )}

              <Input
                name="email"
                label="Email Address"
                handleChange={handleChange}
                type="email"
              />
              <Input
                name="password"
                label="Password"
                handleChange={handleChange}
                type={showPassword ? 'text' : 'password'}
                handleShowPassword={handleShowPassword}
                half={isExistingUser ? false : true}
                showBar={isExistingUser ? false : true}
                passValue={formData.password}
              />
              {!isExistingUser && (
                <>
                  <Input
                    name="confirmPassword"
                    label="Confirm Password"
                    handleChange={handleChange}
                    type="password"
                    half
                  />
                </>
              )}
            </Grid>
            <Button
              type="submit"
              sx={styles.submit}
              fullWidth
              variant="contained"
              color="primary"
            >
              {isExistingUser ? 'Login' : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button onClick={switchLogin}>
                  {isExistingUser
                    ? "Don't Have An Account? Sign Up."
                    : 'Already Have An Account? Login.'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Login;
