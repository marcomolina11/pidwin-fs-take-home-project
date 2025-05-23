import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import mongoose, { Document } from 'mongoose';

// Document Types
export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  tokens: number;
  currentWinStreak: number;
  highestWinStreak: number;
}

export interface GameDocument extends Document {
  isComplete: boolean;
  dice1?: number;
  dice2?: number;
  createdAt: Date;
  bets: mongoose.Types.ObjectId[];
  canAcceptBets: boolean;
  rollResult?: number;
  isLuckySeven?: boolean;
}

export interface BetDocument extends Document {
  user: mongoose.Types.ObjectId;
  game: mongoose.Types.ObjectId;
  amount: number;
  isLuckySeven: boolean;
  result: 'pending' | 'win' | 'lose';
}

export interface PopulatedBetDocument extends Omit<BetDocument, 'user'> {
  user: UserDocument;
}

// Request Object Types

export interface AuthRequest extends Request {
  userId?: string;
}

// Request Body Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface PasswordChangeRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface PlaceBetRequest {
  amount: number;
  isLuckySeven: boolean;
}

// Payload Types
export interface UserJwtPayload extends JwtPayload {
  _id: string;
  name: string;
  email: string;
}

// Response Types
export interface PlaceBetResponse {
  message: string;
  status: 'accepted' | 'rejected';
  updatedUser?: UserDocument | null;
}

// Game Result Types
export interface UserResultValue {
  userId: string;
  result: 'pending' | 'win' | 'lose';
}

export interface UserResults {
  [userId: string]: UserResultValue;
}
