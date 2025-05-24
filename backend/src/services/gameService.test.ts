import { unbiasedDieRoll, calculatePayout } from './gameService.js';

// Mocking the entire gameService to prevent starting game cycles
jest.mock('./gameService', () => {
  const originalModule = jest.requireActual('./gameService');
  return {
    ...originalModule,
    startGameCycle: jest.fn(),
    stopGameCycle: jest.fn(),
  };
});

describe('Game Service', () => {
  describe('unbiasedDieRoll', () => {
    test('should return a number between 1 and 6', () => {
      // Run multiple rolls to verify the range
      for (let i = 0; i < 1000; i++) {
        const roll = unbiasedDieRoll();
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('calculatePayout', () => {
    test('should calculate correct payout for Lucky Seven', () => {
      const amount = 10;
      const isLuckySeven = true;
      const payout = calculatePayout(amount, isLuckySeven);
      expect(payout).toBe(80); // Assuming 6x multiplier
    });

    test('should calculate correct payout for Not Seven', () => {
      const amount = 10;
      const isLuckySeven = false;
      const payout = calculatePayout(amount, isLuckySeven);
      expect(payout).toBe(20); // Assuming 2x multiplier
    });
  });
});
