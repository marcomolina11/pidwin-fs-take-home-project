import axios from 'axios';
import {
  LoginFormData,
  SignupFormData,
  PasswordChangeFormData,
  PlaceBetFormData,
} from '../types/actionTypes';

const API = axios.create({ baseURL: 'http://localhost:8000' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${profile.token}`;
  }
  return req;
});

// '/api/user'
export const login = (formData: LoginFormData) =>
  API.post('/api/user/login', formData);
export const signUp = (formData: SignupFormData) =>
  API.post('/api/user/signup', formData);
export const changePassword = (formData: PasswordChangeFormData) =>
  API.post('/api/user/changePassword', formData);
export const getCurrentUser = () => API.get('/api/user/currentUser');

// '/api/game'
export const placeBet = (formData: PlaceBetFormData) =>
  API.post('/api/game/placeBet', formData);
export const getWinStreaks = () => API.get('/api/game/winStreaks');
export const getRecentRolls = () => API.get('/api/game/recentRolls');
export const getCurrentGame = () => API.get('/api/game/current');
