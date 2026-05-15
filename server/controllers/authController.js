import User from '../models/User.js';
import { generateToken, getCookieOptions } from '../utils/jwt.js';
import { validationResult } from 'express-validator';

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    });
  }
  return null;
};

export const register = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
    });

    const token = generateToken(user._id);
    const cookieOptions = getCookieOptions();
    res.cookie(process.env.COOKIE_NAME || 'token', token, cookieOptions);

    return res.status(201).json({
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          'Account has been deactivated. Contact support to reactivate.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const cookieOptions = getCookieOptions();
    res.cookie(process.env.COOKIE_NAME || 'token', token, cookieOptions);

    return res.status(200).json({
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  const cookieOptions = getCookieOptions();
  res.clearCookie(process.env.COOKIE_NAME || 'token', cookieOptions);
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({ user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};
