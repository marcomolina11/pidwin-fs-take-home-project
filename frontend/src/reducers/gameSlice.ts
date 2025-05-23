import { GameState, GameAction } from '../types/actionTypes';
import {
  ADD_GAME_RESULT,
  CLEAR_GAME_RESULTS,
  SET_GAME_RESULTS,
  SET_CURRENT_GAME,
} from '../constants/actionTypes';

const initialState: GameState = {
  recentRolls: [],
  currentGame: null,
};

const gameReducer = (
  state: GameState = initialState,
  action: GameAction
): GameState => {
  switch (action.type) {
    case ADD_GAME_RESULT:
      // Check if this game result is already in the store
      const isDuplicate = state.recentRolls.some(
        (roll) => roll.id === action.payload.id
      );

      // If it's a duplicate, don't add it
      if (isDuplicate) {
        return state;
      }

      // Add new result to beginning and keep only the last 5
      return {
        ...state,
        recentRolls: [action.payload, ...state.recentRolls].slice(0, 5),
      };

    case SET_GAME_RESULTS:
      return {
        ...state,
        recentRolls: action.payload,
      };

    case CLEAR_GAME_RESULTS:
      return {
        ...state,
        recentRolls: [],
      };

    case SET_CURRENT_GAME:
      return {
        ...state,
        currentGame: action.payload,
      };

    default:
      return state;
  }
};

export default gameReducer;
