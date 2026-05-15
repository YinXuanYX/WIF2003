import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  deleteAccount,
} from '../controllers/userController.js';
import {
  updateProfileValidation,
  changePasswordValidation,
} from '../validators/authValidators.js';
import { protect } from '../middleware/auth.js';
import sanitizeBody from '../middleware/sanitize.js';

const router = Router();

router.use(protect);

router.get('/me', getProfile);
router.put('/me', sanitizeBody, updateProfileValidation, updateProfile);
router.put(
  '/me/password',
  sanitizeBody,
  changePasswordValidation,
  changePassword
);
router.patch('/me/deactivate', deactivateAccount);
router.delete('/me', deleteAccount);

export default router;
