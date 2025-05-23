import * as api from '../api';
import * as messages from '../messages';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { PlaceBetFormData, GameResult } from '../types/actionTypes';
import {
  UPDATE_USER,
  ADD_GAME_RESULT,
  CLEAR_GAME_RESULTS,
  SET_GAME_RESULTS,
  SET_CURRENT_GAME,
} from '../constants/actionTypes';
import { PlaceBetResponse } from '../types';

export const placeBet =
  (formData: PlaceBetFormData) =>
  async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {
      const { data } = (await api.placeBet(formData)) as {
        data: PlaceBetResponse;
      };

      if (data.status === 'rejected') {
        messages.error(data?.message || 'Bet Rejected');
      } else if (data.status === 'accepted') {
        dispatch({
          type: UPDATE_USER,
          payload: data.updatedUser,
        });
        messages.success('Bet Placed Successfully');
      }
    } catch (error: any) {
      messages.error(error.response?.data?.message || 'Bet Rejected');
    }
  };

export const addGameResult = (gameResult: GameResult) => ({
  type: ADD_GAME_RESULT,
  payload: gameResult,
});

export const clearGameResults = () => ({
  type: CLEAR_GAME_RESULTS,
});

export const fetchRecentRolls =
  () => async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {
      const { data } = await api.getRecentRolls();

      // Clear existing rolls first
      dispatch({
        type: CLEAR_GAME_RESULTS,
      });

      // Add all results at once in the correct order from the API
      if (data && Array.isArray(data)) {
        dispatch({
          type: SET_GAME_RESULTS,
          payload: data,
        });
      }
    } catch (error: any) {
      console.error('Error fetching recent rolls:', error);
    }
  };

// Add these actions
export const setCurrentGame = (game: any) => ({
  type: SET_CURRENT_GAME,
  payload: game,
});

export const fetchCurrentGame = () => async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
  try {
    const { data } = await api.getCurrentGame();
    
    if (data) {
      dispatch({
        type: SET_CURRENT_GAME,
        payload: data,
      });
    }
  } catch (error) {
    console.error('Error fetching current game:', error);
  }
};
