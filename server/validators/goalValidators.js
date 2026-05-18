import { body, param } from 'express-validator';

export const createGoalValidation = [
  body('title')
    .exists().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title must be under 100 characters'),

  body('targetAmount')
    .exists().withMessage('Target amount is required')
    .isFloat({ min: 0.01, max: 10000000 })
    .withMessage('Target amount must be between 0.01 and 10,000,000'),

  body('targetDate')
    .exists().withMessage('Target date is required')
    .isISO8601().withMessage('Target date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Target date must be in the future');
      }
      return true;
    }),

  body('savedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Saved amount must be 0 or greater'),
];

export const updateGoalValidation = [
  param('goalId').isMongoId().withMessage('Invalid goal ID format'),

  body('title')
    .exists().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title must be under 100 characters'),

  body('targetAmount')
    .exists().withMessage('Target amount is required')
    .isFloat({ min: 0.01, max: 10000000 })
    .withMessage('Target amount must be between 0.01 and 10,000,000'),

  body('savedAmount')
    .exists().withMessage('Saved amount is required')
    .isFloat({ min: 0 })
    .withMessage('Saved amount must be 0 or greater'),

  body('targetDate')
    .exists().withMessage('Target date is required')
    .isISO8601().withMessage('Target date must be a valid date'),
];

export const quickSaveValidation = [
  param('goalId').isMongoId().withMessage('Invalid goal ID format'),

  body('savedAmount')
    .exists().withMessage('Saved amount is required')
    .isFloat({ min: 0 })
    .withMessage('Saved amount must be 0 or greater'),
];

export const goalIdParamValidation = [
  param('goalId').isMongoId().withMessage('Invalid goal ID format'),
];
