import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// User interface
export interface UserData {
  _id: string;
  name: string;
  email: string;
  password: string;
  exp?: number;
  picture?: string;
  tokens: number;
  currentWinStreak: number;
  highestWinStreak: number;
}

// Request Types
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

export interface AuthRequest extends Request {
  userId?: string;
}

// Payload Types
export interface UserJwtPayload extends JwtPayload {
  _id: string;
  name: string;
  email: string;
  password: string;
}

// Response Types
export interface PlaceBetResponse {
  message: string;
  status: 'accepted' | 'rejected';
  updatedUser?: UserData;
}
