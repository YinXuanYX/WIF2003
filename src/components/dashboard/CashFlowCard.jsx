import { useCashFlow } from '../../hooks/useCashFlow'
import SkeletonCard from './SkeletonCard'

function CashFlowCard({ animationOrder = 0 }) {
  const { data, isLoading, totalExpenses, disposableIncome } = useCashFlow()

  if (isLoading) return <SkeletonCard lines={4} />

  return (
    <div
      className="glass-card h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <h6 className="stat-label mb-4">Cash Flow Overview</h6>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="text-muted small mb-1">Net Income</div>
            <div className="stat-value text-success">
              RM {data.netIncome.toLocaleString()}
            </div>
          </div>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 44,
              height: 44,
              background: 'rgba(16, 185, 129, 0.1)',
              fontSize: '1.25rem',
            }}
          >
            ↑
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="text-muted small mb-1">Total Expenses</div>
            <div className="stat-value text-danger">
              RM {totalExpenses.toLocaleString()}
            </div>
          </div>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 44,
              height: 44,
              background: 'rgba(239, 68, 68, 0.1)',
              fontSize: '1.25rem',
            }}
          >
            ↓
          </div>
        </div>

        <hr style={{ opacity: 0.08 }} />

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <div className="text-muted small mb-1">Disposable Income</div>
            <div className="stat-value text-primary">
              RM {disposableIncome.toLocaleString()}
            </div>
          </div>
          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--bs-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Available
          </span>
        </div>
      </div>
    </div>
  )
}

export default CashFlowCard
