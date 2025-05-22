import { Request, Response } from 'express';
import User from '../models/user.js';

const getWinStreaks = async (req: Request, res: Response) => {
  try {
    const topUsers = await User.find({})
      .sort({ highestWinStreak: -1 })
      .limit(10)
      .select('name highestWinStreak');

    res.status(200).json(topUsers);
  } catch (error) {
    console.error('Error fetching top win streaks:', error);
    res.status(500).json({ message: 'Failed to fetch top win streaks' });
  }
};

export default getWinStreaks;
