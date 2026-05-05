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
      className="glass-card h-100 animate-fade-in-up"
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
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {percent}%
                </span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className={`progress-bar ${colorClass}`}
                  role="progressbar"
                  style={{
                    width: `${percent}%`,
                    borderRadius: '1rem',
                    transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                RM {goal.savedAmount.toLocaleString()} of RM {goal.targetAmount.toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GoalProgressCard
