import { RootState } from '../types/store';

export const selectRecentRolls = (state: RootState) => state.game.recentRolls;
export const selectCurrentGame = (state: RootState) => state.game.currentGame;
