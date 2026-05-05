import { useCashFlow } from '../../hooks/useCashFlow'
import SkeletonCard from './SkeletonCard'

function CashFlowCard({ animationOrder = 0 }) {
  const { data, isLoading } = useCashFlow()

  if (isLoading) return <SkeletonCard lines={4} />

  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div
      className="card card-dashboard h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <h6 className="stat-label mb-3">Cash Flow Overview</h6>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="text-muted small">Net Income</div>
            <div className="stat-value text-success">
              RM {data.netIncome.toLocaleString()}
            </div>
          </div>
          <span className="fs-3 text-success opacity-50">↑</span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="text-muted small">Total Expenses</div>
            <div className="stat-value text-danger">
              RM {totalExpenses.toLocaleString()}
            </div>
          </div>
          <span className="fs-3 text-danger opacity-50">↓</span>
        </div>

        <hr className="my-2" />

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted small">Disposable Income</div>
            <div className="stat-value text-primary">
              RM {data.disposableIncome.toLocaleString()}
            </div>
          </div>
          <span
            className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
            style={{ fontSize: '0.8rem' }}
          >
            Available
          </span>
        </div>
      </div>
    </div>
  )
}

export default CashFlowCard
