import { UserData } from '.';

// Add GameResult interface
export interface GameResult {
  id: string;
  dice1: number;
  dice2: number;
  rollResult: number;
  isLuckySeven: boolean;
  timestamp: Date;
  userResults: { [key: string]: UserResult };
}

export interface UserResult {
  userId: string;
  result: 'win' | 'lose';
}

// Action types
export enum ActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPDATE_USER = 'UPDATE_USER',
  ADD_GAME_RESULT = 'ADD_GAME_RESULT',
  CLEAR_GAME_RESULTS = 'CLEAR_GAME_RESULTS',
  SET_GAME_RESULTS = 'SET_GAME_RESULTS',
}

// Auth data type
export interface AuthData {
  token: string;
}

// Actions interfaces
export interface LoginAction {
  type: ActionType.LOGIN;
  data: AuthData;
}

export interface LogoutAction {
  type: ActionType.LOGOUT;
}

export interface UpdateUserAction {
  type: ActionType.UPDATE_USER;
  payload: UserData;
}

export interface AddGameResultAction {
  type: ActionType.ADD_GAME_RESULT;
  payload: GameResult;
}

export interface ClearGameResultsAction {
  type: ActionType.CLEAR_GAME_RESULTS;
}

export interface SetGameResultsAction {
  type: ActionType.SET_GAME_RESULTS;
  payload: GameResult[];
}

export type AuthAction = LoginAction | LogoutAction | UpdateUserAction;
export type GameAction = AddGameResultAction | ClearGameResultsAction | SetGameResultsAction;

// State interfaces
export interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface GameState {
  recentRolls: GameResult[];
}

// Form data interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface PasswordChangeFormData {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface PlaceBetFormData {
  amount: number;
  isLuckySeven: boolean;
}
