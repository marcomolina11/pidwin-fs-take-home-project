import { AuthState, GameState } from './actionTypes';

export interface RootState {
  auth: AuthState;
  game: GameState;
}
