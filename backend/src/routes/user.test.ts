import express from 'express';
import request from 'supertest';
import userRouter from './user.js';

// Mock the imported modules
jest.mock('../utils/auth.js', () => {
  return jest.fn((req, res, next) => next());
});

jest.mock('../api/user-login.js', () => {
  return jest.fn((req, res) => res.status(200).json({ message: 'login-mock' }));
});

jest.mock('../api/user-signup.js', () => {
  return jest.fn((req, res) =>
    res.status(200).json({ message: 'signup-mock' })
  );
});

jest.mock('../api/user-change-password.js', () => {
  return jest.fn((req, res) =>
    res.status(200).json({ message: 'change-password-mock' })
  );
});

jest.mock('../api/user-current.js', () => {
  return jest.fn((req, res) =>
    res.status(200).json({ message: 'current-user-mock' })
  );
});

// Import mocked modules
import auth from '../utils/auth.js';
import login from '../api/user-login.js';
import signup from '../api/user-signup.js';
import changePassword from '../api/user-change-password.js';
import getCurrentUser from '../api/user-current.js';

describe('User Router', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/user', userRouter);
    jest.clearAllMocks();
  });

  test('POST /login should call login handler', async () => {
    await request(app).post('/api/user/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(login).toHaveBeenCalled();
    // No auth middleware expected on this route
    expect(auth).not.toHaveBeenCalled();
  });

  test('POST /signup should call signup handler', async () => {
    await request(app).post('/api/user/signup').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(signup).toHaveBeenCalled();
    // No auth middleware expected on this route
    expect(auth).not.toHaveBeenCalled();
  });

  test('POST /changePassword should use auth middleware and call changePassword handler', async () => {
    await request(app).post('/api/user/changePassword').send({
      oldPassword: 'oldpass',
      newPassword: 'newpass',
    });

    expect(auth).toHaveBeenCalled();
    expect(changePassword).toHaveBeenCalled();
  });

  test('GET /currentUser should use auth middleware and call getCurrentUser handler', async () => {
    await request(app).get('/api/user/currentUser');

    expect(auth).toHaveBeenCalled();
    expect(getCurrentUser).toHaveBeenCalled();
  });
});
