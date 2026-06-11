// Module 3: Goal-Based Planning — Unit Tests

import { describe, test, expect } from '@jest/globals';

const goals = [
  {
    title: 'Emergency Fund',
    targetAmount: 10000,
    savedAmount: 4500,
    targetDate: '2026-12-31',
  },
  {
    title: 'New Laptop',
    targetAmount: 5000,
    savedAmount: 5000, // exact match — boundary case
    targetDate: '2026-09-15',
  },
  {
    title: 'Japan Trip',
    targetAmount: 8000,
    savedAmount: 9200, // over-achieved
    targetDate: '2027-03-01',
  },
  {
    title: 'Wedding Fund',
    targetAmount: 50000,
    savedAmount: 0, // nothing saved yet
    targetDate: '2028-06-01',
  },
];


function getGoalStatus(savedAmount, targetAmount) {
  if (savedAmount >= targetAmount) return 'Achieved';
  return 'Pending';
}

// UT-01  Goal Data Structure
 
describe('UT-01 Goal Data Structure', () => {
  test('every goal object contains the required properties', () => {
    const requiredKeys = ['title', 'targetAmount', 'savedAmount', 'targetDate'];

    goals.forEach((goal) => {
      requiredKeys.forEach((key) => {
        expect(goal).toHaveProperty(key);
      });
    });
  });

  test('goals array is not empty', () => {
    expect(goals.length).toBeGreaterThan(0);
  });

  test('no goal has extra unexpected properties', () => {
    const allowedKeys = ['title', 'targetAmount', 'savedAmount', 'targetDate'];

    goals.forEach((goal) => {
      const keys = Object.keys(goal);
      keys.forEach((key) => {
        expect(allowedKeys).toContain(key);
      });
    });
  });
});

// UT-02  Goal Status Logic
 
describe('UT-02 Goal Status Logic', () => {
  test('returns "Pending" when savedAmount < targetAmount (normal case)', () => {
    // Emergency Fund: 4500 / 10000
    expect(getGoalStatus(4500, 10000)).toBe('Pending');
  });

  test('returns "Achieved" when savedAmount === targetAmount (boundary case)', () => {
    // New Laptop: 5000 / 5000
    expect(getGoalStatus(5000, 5000)).toBe('Achieved');
  });

  test('returns "Achieved" when savedAmount > targetAmount (over-achieved)', () => {
    // Japan Trip: 9200 / 8000
    expect(getGoalStatus(9200, 8000)).toBe('Achieved');
  });

  test('returns "Pending" when savedAmount is 0', () => {
    // Wedding Fund: 0 / 50000
    expect(getGoalStatus(0, 50000)).toBe('Pending');
  });

  test('returns "Achieved" when both amounts are 0 (edge case)', () => {
    expect(getGoalStatus(0, 0)).toBe('Achieved');
  });
});

//UT-03  EJS View Engine Configuration

describe('UT-03 EJS View Engine Configuration', () => {
  
  let app;

  // Use a dynamic import so Jest can handle the ESM express module
  beforeAll(async () => {
    const express = (await import('express')).default;
    const path = await import('path');

    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.resolve('views'));
  });

  test('view engine is set to "ejs"', () => {
    expect(app.get('view engine')).toBe('ejs');
  });

  test('views directory is configured correctly', () => {
    const viewsDir = app.get('views');
    expect(viewsDir).toBeDefined();
    expect(typeof viewsDir).toBe('string');
    expect(viewsDir).toMatch(/views$/);
  });
});

// UT-04  Data Types Validation
 
describe('UT-04 Data Types Validation', () => {
  test('title is a non-empty string for every goal', () => {
    goals.forEach((goal) => {
      expect(typeof goal.title).toBe('string');
      expect(goal.title.length).toBeGreaterThan(0);
    });
  });

  test('targetAmount is a non-negative number for every goal', () => {
    goals.forEach((goal) => {
      expect(typeof goal.targetAmount).toBe('number');
      expect(goal.targetAmount).toBeGreaterThanOrEqual(0);
    });
  });

  test('savedAmount is a non-negative number for every goal', () => {
    goals.forEach((goal) => {
      expect(typeof goal.savedAmount).toBe('number');
      expect(goal.savedAmount).toBeGreaterThanOrEqual(0);
    });
  });

  test('targetDate matches YYYY-MM-DD date format for every goal', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    goals.forEach((goal) => {
      expect(typeof goal.targetDate).toBe('string');
      expect(goal.targetDate).toMatch(dateRegex);
    });
  });

  test('targetAmount is not NaN or Infinity', () => {
    goals.forEach((goal) => {
      expect(Number.isFinite(goal.targetAmount)).toBe(true);
    });
  });

  test('savedAmount is not NaN or Infinity', () => {
    goals.forEach((goal) => {
      expect(Number.isFinite(goal.savedAmount)).toBe(true);
    });
  });
});
