import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserDocument, UserJwtPayload } from '../types/index.js';

// Destructure the CommonJS exports
const { JsonWebTokenError, TokenExpiredError } = jwt;

dotenv.config();

// Validate jwt secret is available
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // In production this is a fatal error
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'FATAL ERROR: JWT_SECRET is not defined in environment variables'
    );
    process.exit(1);
  } else {
    // In development continue with fallback
    console.warn(
      'WARNING: JWT_SECRET is not defined, using an insecure fallback (NOT FOR PRODUCTION)'
    );
  }
}

// Environment variable fallback for development only!
const getJwtSecret = () => {
  if (JWT_SECRET) return JWT_SECRET;

  return 'insecure_dev_jwt_secret_' + Date.now().toString();
};

// jwt expiration config
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const generateToken = (user: UserDocument): string => {
  if (!user._id) {
    throw new Error('User ID is required to generate token');
  }

  const payload: UserJwtPayload = {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
  };

  // Using expiresIn value directly in the sign function
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): UserJwtPayload => {
  try {
    return jwt.verify(token, getJwtSecret()) as UserJwtPayload;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof TokenExpiredError) {
      throw new Error('Token expired');
    } else {
      throw new Error('Token verification failed');
    }
  }
};
