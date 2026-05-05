/**
 * Soft notification displayed when a user has more than 20 active goals.
 * Per PRD: maintains interface clarity and prevents cognitive overload.
 */
function GoalLimitWarning({ goalCount, onDismiss }) {
  return (
    <div
      className="alert alert-info d-flex align-items-start gap-2 goal-warning-banner mb-4"
      role="alert"
    >
      <span className="fs-5 flex-shrink-0" aria-hidden="true">💡</span>
      <div className="flex-grow-1">
        <strong className="d-block mb-1">Too Many Active Goals</strong>
        <span className="small">
          You currently have <strong>{goalCount} active goals</strong>.
          Consider focusing on fewer goals for better clarity and more
          achievable progress tracking.
        </span>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="btn-close flex-shrink-0 mt-1"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        />
      )}
    </div>
  )
}

export default GoalLimitWarning
