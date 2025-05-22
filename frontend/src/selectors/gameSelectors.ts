import { RootState } from '../types/store';

export const selectRecentRolls = (state: RootState) => state.game.recentRolls;