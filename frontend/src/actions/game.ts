import * as api from '../api';
import * as messages from '../messages';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { PlaceBetFormData } from '../types/actionTypes';
import { UPDATE_USER } from '../constants/actionTypes';

export const placeBet =
  (formData: PlaceBetFormData) =>
  async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    try {
      const { data } = await api.placeBet(formData);

      dispatch({
        type: UPDATE_USER,
        payload: data.updatedUser,
      });

      messages.success('Bet Placed Successfully');
    } catch (error: any) {
      messages.error(error.response?.data?.message || 'Bet Rejected');
    }
  };
