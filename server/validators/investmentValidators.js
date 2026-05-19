import { body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

export const submitInvestmentProfileValidation = [
  body('answers')
    .exists()
    .withMessage('answers is required')
    .isArray({ min: 6, max: 6 })
    .withMessage('answers must contain exactly 6 values'),

  body('answers.*')
    .isInt({ min: 0, max: 5 })
    .withMessage('Each answer must be an integer between 0 and 5'),

  body('score')
    .exists()
    .withMessage('score is required')
    .isInt({ min: 0, max: 30 })
    .withMessage('score must be an integer between 0 and 30'),

  body('profile')
    .not()
    .exists()
    .withMessage('profile must not be provided by client'),

  body().custom((value) => {
    if (!Array.isArray(value.answers)) {
      return true;
    }

    const sum = value.answers.reduce((total, answer) => total + Number(answer), 0);
    if (sum !== Number(value.score)) {
      throw new Error('score must match the sum of answers');
    }

    return true;
  }),

  validate,
];
