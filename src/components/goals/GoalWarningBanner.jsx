/**
 * Non-blocking warning banner displayed when cumulative required monthly
 * savings across all active goals exceed the user's disposable income.
 *
 * Per PRD: alerts the user to potential financial overextension without
 * restricting their ability to save data.
 */
function GoalWarningBanner({ totalRequiredMonthly, disposableIncome, onDismiss }) {
  const excess = (totalRequiredMonthly - disposableIncome).toFixed(2)

  return (
    <div
      className="alert alert-warning d-flex align-items-start gap-2 goal-warning-banner mb-4"
      role="alert"
    >
      <span className="fs-5 flex-shrink-0" aria-hidden="true">⚠️</span>
      <div className="flex-grow-1">
        <strong className="d-block mb-1">Financial Overextension Warning</strong>
        <span className="small">
          Your combined monthly savings target{' '}
          <strong>(RM {totalRequiredMonthly.toLocaleString()})</strong> exceeds your
          disposable income{' '}
          <strong>(RM {disposableIncome.toLocaleString()})</strong> by{' '}
          <strong>RM {Number(excess).toLocaleString()}</strong>.
          Consider adjusting your goal timelines or target amounts.
        </span>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="btn-close flex-shrink-0 mt-1"
          onClick={onDismiss}
          aria-label="Dismiss warning"
        />
      )}
    </div>
  )
}

export default GoalWarningBanner
