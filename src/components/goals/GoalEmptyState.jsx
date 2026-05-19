import { Link } from 'react-router-dom'

function GoalEmptyState() {
  return (
    <div className="goal-empty-state animate-fade-in-up">
      <span className="goal-empty-state__icon">📊</span>
      <h2 className="goal-empty-state__title">
        Set Up Your Financial Baseline First
      </h2>
      <p className="goal-empty-state__text">
        Before you can start planning goals, you need to set up your income and
        expenses so we can calculate your disposable income and help you plan
        realistically.
      </p>
      <Link to="/dashboard" className="btn btn-primary btn-lg fw-semibold">
        🏦 Go to Cash Flow Setup
      </Link>
    </div>
  )
}

export default GoalEmptyState
