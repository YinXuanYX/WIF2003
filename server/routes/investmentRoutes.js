import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import sanitizeBody from '../middleware/sanitize.js';
import { submitInvestmentProfile } from '../controllers/investmentController.js';
import { submitInvestmentProfileValidation } from '../validators/investmentValidators.js';

const router = Router();

router.use(protect);

router.post('/profile', sanitizeBody, submitInvestmentProfileValidation, submitInvestmentProfile);

export default router;
