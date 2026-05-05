/**
 * Individual goal display card with progress bar, monthly saving badge,
 * months remaining, and edit/delete action buttons.
 */
function GoalCard({ goal, animationOrder = 0, onEdit, onDelete }) {
  const {
    title,
    targetAmount,
    savedAmount,
    targetDate,
    progressPercent,
    requiredMonthlySaving,
    monthsRemaining,
    isCompleted,
  } = goal

  const formattedDate = new Date(targetDate).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Color-coded progress: green ≥66%, yellow ≥33%, blue <33%
  function getProgressColor(percent) {
    if (percent >= 66) return 'bg-success'
    if (percent >= 33) return 'bg-warning'
    return 'bg-primary'
  }

  const cardClass = `goal-card animate-fade-in-up${isCompleted ? ' goal-card--completed' : ''}`

  return (
    <div
      className={cardClass}
      style={{ '--animation-order': animationOrder }}
    >
      <div className="goal-card__body">
        {/* Title & Date */}
        <h5 className="goal-card__title">{title}</h5>
        <p className="goal-card__date">
          🎯 Target: {formattedDate}
        </p>

        {/* Saved / Target amounts */}
        <div className="goal-card__amounts">
          <span className="goal-card__saved">
            RM {savedAmount.toLocaleString()}
          </span>
          <span className="goal-card__target">
            / RM {targetAmount.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="goal-card__progress">
          <div className="progress">
            <div
              className={`progress-bar ${getProgressColor(progressPercent)}`}
              role="progressbar"
              style={{ width: `${progressPercent}%`, transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Footer: badges + actions */}
        <div className="goal-card__footer">
          <div className="d-flex flex-wrap gap-2">
            {isCompleted ? (
              <span className="goal-badge goal-badge--completed">
                ✅ Goal Reached
              </span>
            ) : (
              <>
                <span className="goal-badge goal-badge--monthly">
                  💰 RM {requiredMonthlySaving.toLocaleString()}/mo
                </span>
                <span className="goal-badge goal-badge--remaining">
                  📅 {monthsRemaining} mo left
                </span>
              </>
            )}
          </div>

          <div className="goal-card__actions">
            <button
              className="goal-action-btn"
              onClick={() => onEdit?.(goal)}
              aria-label={`Edit ${title}`}
              title="Edit goal"
            >
              ✏️
            </button>
            <button
              className="goal-action-btn goal-action-btn--danger"
              onClick={() => onDelete?.(goal)}
              aria-label={`Delete ${title}`}
              title="Delete goal"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoalCard
