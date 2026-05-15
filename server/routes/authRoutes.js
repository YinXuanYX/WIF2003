import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
} from '../validators/authValidators.js';
import { protectForMe } from '../middleware/auth.js';
import sanitizeBody from '../middleware/sanitize.js';

const router = Router();

router.post('/register', sanitizeBody, registerValidation, register);
router.post('/login', sanitizeBody, loginValidation, login);
router.post('/logout', logout);
router.get('/me', protectForMe, getMe);

export default router;
