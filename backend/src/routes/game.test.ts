import express from 'express';
import request from 'supertest';
import gameRouter from './game.js';

// Mock the imported modules
jest.mock('../utils/auth.js', () => {
  return jest.fn((req, res, next) => next());
});

jest.mock('../api/game-place-bet.js', () => {
  return jest.fn((req, res) =>
    res.status(200).json({ message: 'place-bet-mock' })
  );
});

jest.mock('../api/game-win-streaks.js', () => {
  return jest.fn((req, res) =>
    res.status(200).json({ message: 'win-streaks-mock' })
  );
});

jest.mock('../api/game-recent-rolls.js', () => {
  return jest.fn((req, res) =>
    res.status(200).json({ message: 'recent-rolls-mock' })
  );
});

jest.mock('../api/game-current.js', () => {
  return jest.fn((req, res) =>
    res.status(200).json({ message: 'current-game-mock' })
  );
});

// Import mocked modules
import auth from '../utils/auth.js';
import placeBet from '../api/game-place-bet.js';
import getWinStreaks from '../api/game-win-streaks.js';
import getRecentRolls from '../api/game-recent-rolls.js';
import getCurrentGame from '../api/game-current.js';

describe('Game Router', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/game', gameRouter);
    jest.clearAllMocks();
  });

  test('POST /placeBet should use auth middleware and call placeBet handler', async () => {
    await request(app).post('/api/game/placeBet').send({});

    expect(auth).toHaveBeenCalled();
    expect(placeBet).toHaveBeenCalled();
  });

  test('GET /winStreaks should call getWinStreaks handler', async () => {
    await request(app).get('/api/game/winStreaks');

    expect(getWinStreaks).toHaveBeenCalled();
    // No auth middleware expected on this route
    expect(auth).not.toHaveBeenCalled();
  });

  test('GET /recentRolls should use auth middleware and call getRecentRolls handler', async () => {
    await request(app).get('/api/game/recentRolls');

    expect(auth).toHaveBeenCalled();
    expect(getRecentRolls).toHaveBeenCalled();
  });

  test('GET /currentGame should use auth middleware and call getCurrentGame handler', async () => {
    await request(app).get('/api/game/currentGame');

    expect(auth).toHaveBeenCalled();
    expect(getCurrentGame).toHaveBeenCalled();
  });
});
