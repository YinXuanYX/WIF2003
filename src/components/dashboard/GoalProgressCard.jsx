import { useGoals } from '../../hooks/useGoals'
import SkeletonCard from './SkeletonCard'

function getProgressColor(percent) {
  if (percent >= 66) return 'bg-success'
  if (percent >= 33) return 'bg-warning'
  return 'bg-primary'
}

function GoalProgressCard({ animationOrder = 1 }) {
  const { data, isLoading } = useGoals()

  if (isLoading) return <SkeletonCard lines={5} />

  const topGoals = data.slice(0, 3)

  return (
    <div
      className="card card-dashboard h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <h6 className="stat-label mb-3">Goal Progress</h6>

        {topGoals.map((goal) => {
          const percent = Math.round((goal.savedAmount / goal.targetAmount) * 100)
          const colorClass = getProgressColor(percent)

          return (
            <div key={goal._id} className="mb-3">
              <div className="d-flex justify-content-between align-items-baseline mb-1">
                <span className="fw-semibold small">{goal.title}</span>
                <span className="text-muted small">
                  RM {goal.savedAmount.toLocaleString()} / RM{' '}
                  {goal.targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="progress">
                <div
                  className={`progress-bar ${colorClass}`}
                  role="progressbar"
                  style={{ width: `${percent}%` }}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {percent}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GoalProgressCard
