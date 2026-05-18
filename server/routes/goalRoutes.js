import { Router } from 'express';
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  quickSave,
  deleteGoal,
} from '../controllers/goalController.js';
import {
  createGoalValidation,
  updateGoalValidation,
  quickSaveValidation,
  goalIdParamValidation,
} from '../validators/goalValidators.js';
import { protect } from '../middleware/auth.js';
import sanitizeBody from '../middleware/sanitize.js';

const router = Router();

router.use(protect);

router.get('/', getGoals);
router.get('/:goalId', goalIdParamValidation, getGoal);
router.post('/', sanitizeBody, createGoalValidation, createGoal);
router.put('/:goalId', sanitizeBody, updateGoalValidation, updateGoal);
router.patch('/:goalId/save', sanitizeBody, quickSaveValidation, quickSave);
router.delete('/:goalId', goalIdParamValidation, deleteGoal);

export default router;
