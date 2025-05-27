import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { LoginRequest } from '../types/index.js';
import { generateToken } from '../utils/jwtUtils.js';

const login = async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: 'User Does Not Exist' });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid Password' });
    }

    // Generate token using jwt utility
    const token = generateToken(existingUser);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export default login;
