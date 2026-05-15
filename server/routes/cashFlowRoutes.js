import { Router } from 'express';
import {
  getCashFlow,
  updateIncome,
  addExpense,
  removeExpense,
} from '../controllers/cashFlowController.js';
import {
  updateIncomeValidation,
  addExpenseValidation,
  removeExpenseValidation,
} from '../validators/cashFlowValidators.js';
import { protect } from '../middleware/auth.js';
import sanitizeBody from '../middleware/sanitize.js';

const router = Router();

router.use(protect);

router.get('/', getCashFlow);
router.put('/income', sanitizeBody, updateIncomeValidation, updateIncome);
router.post('/expenses', sanitizeBody, addExpenseValidation, addExpense);
router.delete('/expenses/:expenseId', removeExpenseValidation, removeExpense);

export default router;
