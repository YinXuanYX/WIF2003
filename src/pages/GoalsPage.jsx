import { useState, useEffect } from 'react'
import { useCashFlow } from '../hooks/useCashFlow'
import { useGoalCalculations } from '../hooks/useGoalCalculations'
import useGoalsStore from '../stores/useGoalsStore'
import GoalCard from '../components/goals/GoalCard'
import GoalSkeleton from '../components/goals/GoalSkeleton'
import GoalFormModal from '../components/goals/GoalFormModal'
import DeleteConfirmModal from '../components/goals/DeleteConfirmModal'
import GoalEmptyState from '../components/goals/GoalEmptyState'
import GoalWarningBanner from '../components/goals/GoalWarningBanner'
import GoalLimitWarning from '../components/goals/GoalLimitWarning'

function GoalsPage() {
  const { data: cashflow, isLoading: cashflowLoading } = useCashFlow()
  const goals = useGoalsStore((s) => s.goals)
  const addGoal = useGoalsStore((s) => s.addGoal)
  const updateGoal = useGoalsStore((s) => s.updateGoal)
  const deleteGoal = useGoalsStore((s) => s.deleteGoal)

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingGoal, setDeletingGoal] = useState(null)

  // Warning dismiss state
  const [dismissedOverextend, setDismissedOverextend] = useState(false)
  const [dismissedLimit, setDismissedLimit] = useState(false)

  const {
    isNewUser,
    enrichedGoals,
    totalTargetAmount,
    totalSavedAmount,
    overallProgress,
    totalRequiredMonthly,
    disposableIncome,
    isOverextended,
    hasGoalLimitWarning,
    goalCount,
  } = useGoalCalculations(goals, cashflow)

  // Re-show dismissed warnings when the underlying data changes
  useEffect(() => {
    setDismissedOverextend(false)
  }, [isOverextended, totalRequiredMonthly])

  useEffect(() => {
    setDismissedLimit(false)
  }, [goalCount])

  // CRUD handlers
  const handleAddClick = () => {
    setEditingGoal(null)
    setShowFormModal(true)
  }

  const handleEditClick = (goal) => {
    setEditingGoal(goal)
    setShowFormModal(true)
  }

  const handleDeleteClick = (goal) => {
    setDeletingGoal(goal)
    setShowDeleteModal(true)
  }

  const handleFormSubmit = (data) => {
    if (editingGoal) {
      updateGoal(editingGoal._id, data)
    } else {
      addGoal(data)
    }
  }

  const handleDeleteConfirm = (id) => {
    deleteGoal(id)
  }

  const handleQuickSave = (id, newSavedAmount) => {
    updateGoal(id, { savedAmount: newSavedAmount })
  }

  // Show skeleton while cashflow is loading
  if (cashflowLoading) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="goals-header mb-4 animate-fade-in-up">
          <div>
            <h1 className="goals-header__title">📎 Financial Goals</h1>
            <p className="goals-header__subtitle">Loading your goals...</p>
          </div>
        </div>
        <GoalSkeleton count={3} />
      </div>
    )
  }

  // New user — no income set: show empty state, disable goal creation
  if (isNewUser) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="goals-header mb-4 animate-fade-in-up">
          <div>
            <h1 className="goals-header__title">📎 Financial Goals</h1>
            <p className="goals-header__subtitle">
              Set up your financial baseline to get started
            </p>
          </div>
          <button
            className="btn btn-primary btn-add-goal"
            id="btn-add-goal"
            disabled
            title="Complete your cash flow setup first"
          >
            + Add Goal
          </button>
        </div>
        <GoalEmptyState />
      </div>
    )
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Page header */}
      <div className="goals-header mb-4 animate-fade-in-up">
        <div>
          <h1 className="goals-header__title">📎 Financial Goals</h1>
          <p className="goals-header__subtitle">
            {goalCount === 0
              ? 'Start planning your financial future'
              : `${goalCount} goal${goalCount !== 1 ? 's' : ''} · RM ${totalSavedAmount.toLocaleString()} saved of RM ${totalTargetAmount.toLocaleString()}`}
          </p>
        </div>
        <button
          className="btn btn-primary btn-add-goal"
          id="btn-add-goal"
          onClick={handleAddClick}
        >
          + Add Goal
        </button>
      </div>

      {/* Warning banners */}
      {isOverextended && !dismissedOverextend && (
        <GoalWarningBanner
          totalRequiredMonthly={totalRequiredMonthly}
          disposableIncome={disposableIncome}
          onDismiss={() => setDismissedOverextend(true)}
        />
      )}

      {hasGoalLimitWarning && !dismissedLimit && (
        <GoalLimitWarning
          goalCount={goalCount}
          onDismiss={() => setDismissedLimit(true)}
        />
      )}

      {/* Goals grid */}
      {goalCount === 0 ? (
        <div className="goal-empty-state animate-fade-in-up">
          <span className="goal-empty-state__icon">🎯</span>
          <h2 className="goal-empty-state__title">No goals yet</h2>
          <p className="goal-empty-state__text">
            Create your first financial goal to start tracking your progress toward your dreams.
          </p>
        </div>
      ) : (
        <div className="row g-4 mb-4">
          {enrichedGoals.map((goal, i) => (
            <div key={goal._id} className="col-lg-4 col-md-6">
              <GoalCard
                goal={goal}
                animationOrder={i}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onQuickSave={handleQuickSave}
              />
            </div>
          ))}
        </div>
      )}

      {/* Summary card */}
      {goalCount > 0 && (
        <div
          className="goal-summary animate-fade-in-up"
          style={{ '--animation-order': enrichedGoals.length + 1 }}
        >
          <div className="goal-summary__row mb-3">
            <div className="goal-summary__item">
              <div className="goal-summary__value text-success">
                RM {totalSavedAmount.toLocaleString()}
              </div>
              <div className="goal-summary__label">Total Saved</div>
            </div>
            <div className="goal-summary__item">
              <div className="goal-summary__value">
                RM {totalTargetAmount.toLocaleString()}
              </div>
              <div className="goal-summary__label">Total Target</div>
            </div>
            <div className="goal-summary__item">
              <div className="goal-summary__value text-primary">
                RM {totalRequiredMonthly.toLocaleString()}
              </div>
              <div className="goal-summary__label">Required / Month</div>
            </div>
            <div className="goal-summary__item">
              <div className="goal-summary__value" style={{ color: 'var(--bs-info)' }}>
                RM {disposableIncome.toLocaleString()}
              </div>
              <div className="goal-summary__label">Disposable Income</div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="d-flex justify-content-between align-items-baseline mb-1">
            <span className="fw-semibold small">Overall Progress</span>
            <span className="text-muted small">{overallProgress}%</span>
          </div>
          <div className="progress">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${overallProgress}%`, transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
              aria-valuenow={overallProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <GoalFormModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        editGoal={editingGoal}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        goal={deletingGoal}
      />
    </div>
  )
}

export default GoalsPage
