import Goal from '../models/Goal.js';
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

function getMonthsRemaining(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  return Math.max(months, 1);
}

function enrichGoal(goalDoc) {
  const obj = goalDoc.toObject ? goalDoc.toObject() : goalDoc;
  const remaining = Math.max(obj.targetAmount - obj.savedAmount, 0);
  const monthsRemaining = getMonthsRemaining(obj.targetDate);
  const requiredMonthlySaving = remaining > 0 ? remaining / monthsRemaining : 0;
  const progressPercent = Math.min(
    Math.round((obj.savedAmount / obj.targetAmount) * 100),
    100
  );
  const isCompleted = obj.savedAmount >= obj.targetAmount;

  return {
    id: obj._id.toString(),
    title: obj.title,
    targetAmount: obj.targetAmount,
    savedAmount: obj.savedAmount,
    targetDate: obj.targetDate,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    remainingAmount: Math.round(remaining * 100) / 100,
    monthsRemaining,
    requiredMonthlySaving: Math.round(requiredMonthlySaving * 100) / 100,
    progressPercent,
    isCompleted,
  };
}

function getDisposableIncome(cashFlowDoc) {
  if (!cashFlowDoc) return 0;
  const totalExpenses = (cashFlowDoc.expenses || []).reduce(
    (sum, e) => sum + e.amount,
    0
  );
  return cashFlowDoc.netIncome - totalExpenses;
}

function buildFeasibilitySummary(enrichedGoals, disposableIncome) {
  const activeGoals = enrichedGoals.filter((g) => !g.isCompleted);
  const completedGoals = enrichedGoals.filter((g) => g.isCompleted);

  const totalTargetAmount = enrichedGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSavedAmount = enrichedGoals.reduce((s, g) => s + g.savedAmount, 0);
  const overallProgress =
    totalTargetAmount > 0
      ? Math.min(Math.round((totalSavedAmount / totalTargetAmount) * 100), 100)
      : 0;

  const totalRequiredMonthlySaving = activeGoals.reduce(
    (s, g) => s + g.requiredMonthlySaving,
    0
  );
  const isFeasible = totalRequiredMonthlySaving <= disposableIncome;
  const warningFlag = !isFeasible && activeGoals.length > 0;
  const exceedsRecommendedGoalLimit = activeGoals.length > 20;

  return {
    totalGoals: enrichedGoals.length,
    activeCount: activeGoals.length,
    completedCount: completedGoals.length,
    totalTargetAmount,
    totalSavedAmount,
    overallProgress,
    totalRequiredMonthlySaving: Math.round(totalRequiredMonthlySaving * 100) / 100,
    disposableIncome,
    isFeasible,
    warningFlag,
    exceedsRecommendedGoalLimit,
  };
}

export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const cashFlow = await CashFlow.findOne({ userId: req.user._id });
    const disposableIncome = getDisposableIncome(cashFlow);

    const enrichedGoals = goals.map(enrichGoal);
    const summary = buildFeasibilitySummary(enrichedGoals, disposableIncome);

    return res.status(200).json({ goals: enrichedGoals, summary });
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    return res.status(200).json({ goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const cashFlow = await CashFlow.findOne({ userId: req.user._id });
    if (!cashFlow || cashFlow.netIncome === 0) {
      return res.status(400).json({
        message:
          'Please set your income in the Cash Flow module before creating goals.',
      });
    }

    const { title, targetAmount, targetDate, savedAmount } = req.body;

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      targetAmount,
      targetDate,
      savedAmount: savedAmount || 0,
    });

    return res.status(201).json({ goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { title, targetAmount, savedAmount, targetDate } = req.body;

    goal.title = title;
    goal.targetAmount = targetAmount;
    goal.savedAmount = savedAmount;
    goal.targetDate = targetDate;
    await goal.save();

    return res.status(200).json({ goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

export const quickSave = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.savedAmount = req.body.savedAmount;
    await goal.save();

    return res.status(200).json({ goal: enrichGoal(goal) });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError !== null) return;

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await goal.deleteOne();
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
