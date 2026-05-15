import CashFlow from '../models/CashFlow.js';
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

const buildCashFlowResponse = (cashFlowDoc) => {
  if (!cashFlowDoc) {
    return { netIncome: 0, expenses: [], disposableIncome: 0 };
  }

  const obj = cashFlowDoc.toObject();
  const totalExpenses = obj.expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    netIncome: obj.netIncome,
    expenses: obj.expenses.map((e) => ({
      id: e._id.toString(),
      label: e.label,
      amount: e.amount,
    })),
    disposableIncome: obj.netIncome - totalExpenses,
  };
};

export const getCashFlow = async (req, res, next) => {
  try {
    const cashFlow = await CashFlow.findOne({ userId: req.user._id });
    return res.status(200).json(buildCashFlowResponse(cashFlow));
  } catch (error) {
    next(error);
  }
};

export const updateIncome = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const { netIncome } = req.body;

    const cashFlow = await CashFlow.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { netIncome } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json(buildCashFlowResponse(cashFlow));
  } catch (error) {
    next(error);
  }
};

export const addExpense = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const { label, amount } = req.body;

    const cashFlow = await CashFlow.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { expenses: { label, amount } } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json(buildCashFlowResponse(cashFlow));
  } catch (error) {
    next(error);
  }
};

export const removeExpense = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const { expenseId } = req.params;

    const cashFlow = await CashFlow.findOne({ userId: req.user._id });

    if (!cashFlow) {
      return res.status(404).json({ message: 'Cash flow record not found' });
    }

    const expense = cashFlow.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    cashFlow.expenses.pull(expenseId);
    await cashFlow.save();

    return res.status(200).json(buildCashFlowResponse(cashFlow));
  } catch (error) {
    next(error);
  }
};
