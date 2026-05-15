import { body, param } from 'express-validator';

export const updateIncomeValidation = [
  body('netIncome')
    .exists()
    .withMessage('Net income is required')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Net income must be a number between 0 and 1,000,000'),
];

export const addExpenseValidation = [
  body('label')
    .exists()
    .withMessage('Expense label is required')
    .isString()
    .withMessage('Label must be a string')
    .trim()
    .notEmpty()
    .withMessage('Expense label cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Expense label must be under 50 characters'),

  body('amount')
    .exists()
    .withMessage('Expense amount is required')
    .isFloat({ min: 0.01, max: 500000 })
    .withMessage('Amount must be a positive number no greater than 500,000'),
];

export const removeExpenseValidation = [
  param('expenseId')
    .isMongoId()
    .withMessage('Invalid expense ID format'),
];
