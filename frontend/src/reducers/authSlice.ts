import { AuthState, AuthAction } from '../types/actionTypes';
import { UserData } from '../types';
import { LOGIN, LOGOUT, UPDATE_USER } from '../constants/actionTypes';
import { jwtDecode } from 'jwt-decode';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const profile = localStorage.getItem('profile');
if (profile) {
  try {
    const { token } = JSON.parse(profile);
    if (token) {
      const user = jwtDecode<UserData>(token);
      initialState.user = user;
      initialState.token = token;
      initialState.isAuthenticated = true;
    }
  } catch (error) {
    console.error('Error parsing auth data from localStorage:', error);
  }
}

const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case LOGIN:
      const { token } = action.data;
      const user = jwtDecode<UserData>(token);
      localStorage.setItem('profile', JSON.stringify({ token }));
      return {
        ...state,
        user,
        token,
        isAuthenticated: true,
      };
    case LOGOUT:
      localStorage.removeItem('profile');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
