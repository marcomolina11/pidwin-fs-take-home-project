import { combineReducers } from 'redux';
import authReducer from './authSlice';
import gameReducer from './gameSlice';

export default combineReducers({
  auth: authReducer,
  game: gameReducer,
});
