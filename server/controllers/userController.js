import User from '../models/User.js';
import CashFlow from '../models/CashFlow.js';
import Goal from '../models/Goal.js';
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

export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({ user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const { name, email } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      const existing = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    res.clearCookie(process.env.COOKIE_NAME || 'token', cookieOptions);

    return res.status(200).json({ message: 'Account deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Goal.deleteMany({ userId }),
      CashFlow.deleteOne({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    res.clearCookie(process.env.COOKIE_NAME || 'token', cookieOptions);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
