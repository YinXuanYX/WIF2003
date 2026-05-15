import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

const extractToken = (req) => {
  const cookieName = process.env.COOKIE_NAME || 'token';
  return req.cookies?.[cookieName] || null;
};

export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account has been deactivated. Contact support to reactivate.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    next(error);
  }
};

export const protectForMe = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    next(error);
  }
};
