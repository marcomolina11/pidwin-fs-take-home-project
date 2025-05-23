import { Response } from 'express';
import { PlaceBetResponse, UserDocument } from '../types/index.js';

export const createBetResponse = (
  res: Response,
  status: number,
  message: string,
  responseStatus: 'accepted' | 'rejected',
  updatedUser?: Omit<UserDocument, 'password'> | null
): Response => {
  const response: PlaceBetResponse = {
    message,
    status: responseStatus,
    updatedUser: updatedUser || null,
  };

  return res.status(status).json(response);
};
