import { RootState } from '../types/store';

export const selectRecentRolls = (state: RootState) => state.game.recentRolls;
export const selectCurrentGame = (state: RootState) => state.game.currentGame;
export const selectHasActiveBet = (state: RootState) => state.game.hasActiveBet;
