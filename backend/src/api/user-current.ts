import { Response } from 'express';
import User from '../models/user.js';
import { AuthRequest } from '../types/index.js';

const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(400).json({ message: 'Unauthenticated' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export default getCurrentUser;
