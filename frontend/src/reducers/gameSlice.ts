import { GameState, GameAction } from '../types/actionTypes';
import {
  ADD_GAME_RESULT,
  CLEAR_GAME_RESULTS,
  SET_GAME_RESULTS,
} from '../constants/actionTypes';

const initialState: GameState = {
  recentRolls: [],
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
      // Set all results at once (used for initial load from API)
      // The API already sends them in the correct order
      return {
        ...state,
        recentRolls: action.payload,
      };

    case CLEAR_GAME_RESULTS:
      return {
        ...state,
        recentRolls: [],
      };

    default:
      return state;
  }
};

export default gameReducer;
