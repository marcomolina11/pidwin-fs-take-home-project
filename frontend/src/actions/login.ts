import { LOGIN, LOGOUT, UPDATE_USER } from '../constants/actionTypes';
import * as api from '../api';
import * as messages from '../messages';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { NavigateFunction } from 'react-router-dom';
import {
  SignupFormData,
  LoginFormData,
  PasswordChangeFormData,
} from '../types/actionTypes';

export const signup =
  (formData: SignupFormData, history: NavigateFunction) =>
  async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {
      const { data } = await api.signUp(formData);
      dispatch({ type: LOGIN, data });
      history('/');
      messages.success('Login Successful');
    } catch (error: any) {
      messages.error(error.response?.data?.message || 'Signup failed');
    }
  };

export const login =
  (formData: LoginFormData, history: NavigateFunction) =>
  async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {
      const { data } = await api.login(formData);
      console.log('Login data:', data);
      dispatch({ type: LOGIN, data });
      history('/');
      messages.success('Login Successful');
    } catch (error: any) {
      messages.error(error.response?.data?.message || 'Login failed');
    }
  };

export const changePassword =
  (formData: PasswordChangeFormData, history: NavigateFunction) =>
  async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {
      const { data } = await api.changePassword(formData);
      dispatch({ type: LOGOUT, data });
      history('/');
      messages.success('Password Change Was Successful');
    } catch (error: any) {
      messages.error(error.response?.data?.message || 'Password change failed');
    }
  };

export const fetchCurrentUser =
  () => async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {
      const { data } = await api.getCurrentUser();

      dispatch({
        type: UPDATE_USER,
        payload: data,
      });

      return true;
    } catch (error: any) {
      console.error('Failed to fetch current user:', error);
      return false;
    }
  };
