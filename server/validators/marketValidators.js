import { param, query, validationResult } from 'express-validator';

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

export const validateCryptoChart = [
  param('coinId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Coin ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Coin ID must be between 1 and 50 characters'),

  query('days')
    .optional()
    .isIn(['1', '7', '14', '30', '90', '365'])
    .withMessage('Days must be one of: 1, 7, 14, 30, 90, 365'),

  query('currency')
    .optional()
    .isIn(['usd', 'eur', 'gbp', 'jpy', 'myr'])
    .withMessage('Currency must be one of: usd, eur, gbp, jpy, myr'),

  validate,
];

export const validateEquityQuote = [
  param('symbol')
    .isUppercase()
    .withMessage('Symbol must be uppercase')
    .isAlpha()
    .withMessage('Symbol must contain only letters')
    .isLength({ min: 1, max: 5 })
    .withMessage('Symbol must be between 1 and 5 characters'),

  validate,
];

export const validateMarketNews = [
  query('category')
    .optional()
    .isIn(['general', 'forex', 'crypto', 'merger'])
    .withMessage('Category must be one of: general, forex, crypto, merger'),

  validate,
];
