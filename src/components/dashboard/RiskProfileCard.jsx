import { useRiskProfile } from '../../hooks/useRiskProfile'
import SkeletonCard from './SkeletonCard'

const PROFILE_COLORS = {
  Conservative: { bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' },
  Moderate: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
  Aggressive: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
}

const ALLOC_COLORS = {
  bonds: '#3b82f6',
  equities: '#10b981',
  cash: '#f59e0b',
}

function RiskProfileCard({ animationOrder = 2 }) {
  const { data, isLoading } = useRiskProfile()

  if (isLoading) return <SkeletonCard lines={3} />

  const config = PROFILE_COLORS[data.profile] || PROFILE_COLORS.Moderate

  return (
    <div
      className="glass-card h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <h6 className="stat-label mb-3">Risk Profile</h6>

        <div className="d-flex align-items-center gap-3 mb-3">
          <span
            className="badge-profile animate-pulse-glow"
            style={{
              background: config.bg,
              color: config.color,
              border: `1px solid ${config.color}20`,
            }}
          >
            {data.profile}
          </span>
          <span className="text-muted small">Score: {data.score}/30</span>
        </div>

        <div className="allocation-bar mb-3">
          {Object.entries(data.allocation).map(([key, value]) => (
            <div
              key={key}
              className="allocation-bar__segment"
              style={{
                width: `${value}%`,
                backgroundColor: ALLOC_COLORS[key],
              }}
            />
          ))}
        </div>

        <div className="d-flex justify-content-between">
          {Object.entries(data.allocation).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="d-inline-block rounded-circle me-1"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: ALLOC_COLORS[key],
                }}
              />
              <span className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>
                {key} {value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RiskProfileCard
