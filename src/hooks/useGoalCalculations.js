import { useMemo } from 'react'

/**
 * Calculates the number of full months between now and a target date.
 * Returns at least 1 to avoid division-by-zero.
 */
function getMonthsRemaining(targetDate) {
  const now = new Date()
  const target = new Date(targetDate)
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  return Math.max(months, 1)
}

/**
 * Pure calculation hook — derives planning metrics from goals + cashflow.
 *
 * @param {Array} goals - Array of goal objects from useGoalsStore
 * @param {Object} cashflow - Cashflow data from useCashFlow() { netIncome, disposableIncome }
 * @returns {Object} Derived metrics for the Goals page
 */
export function useGoalCalculations(goals = [], cashflow = {}) {
  return useMemo(() => {
    const { netIncome = 0, disposableIncome = 0 } = cashflow

    // New-user empty state: no income set at all
    const isNewUser = disposableIncome === 0 && netIncome === 0

    // Per-goal enriched data
    const enrichedGoals = goals.map((goal) => {
      const remaining = goal.targetAmount - goal.savedAmount
      const monthsRemaining = getMonthsRemaining(goal.targetDate)
      const requiredMonthlySaving =
        remaining > 0 ? remaining / monthsRemaining : 0
      const progressPercent = Math.min(
        Math.round((goal.savedAmount / goal.targetAmount) * 100),
        100
      )
      const isCompleted = goal.savedAmount >= goal.targetAmount

      return {
        ...goal,
        remaining,
        monthsRemaining,
        requiredMonthlySaving: Math.round(requiredMonthlySaving * 100) / 100,
        progressPercent,
        isCompleted,
      }
    })

    // Aggregate metrics
    const totalTargetAmount = goals.reduce((s, g) => s + g.targetAmount, 0)
    const totalSavedAmount = goals.reduce((s, g) => s + g.savedAmount, 0)
    const overallProgress =
      totalTargetAmount > 0
        ? Math.round((totalSavedAmount / totalTargetAmount) * 100)
        : 0

    const totalRequiredMonthly = enrichedGoals.reduce(
      (s, g) => s + g.requiredMonthlySaving,
      0
    )
    const isOverextended =
      !isNewUser && totalRequiredMonthly > disposableIncome

    // Soft warning when user has more than 20 active goals
    const hasGoalLimitWarning = goals.length > 20

    return {
      isNewUser,
      enrichedGoals,
      totalTargetAmount,
      totalSavedAmount,
      overallProgress,
      totalRequiredMonthly: Math.round(totalRequiredMonthly * 100) / 100,
      isOverextended,
      disposableIncome,
      hasGoalLimitWarning,
      goalCount: goals.length,
    }
  }, [goals, cashflow])
}
