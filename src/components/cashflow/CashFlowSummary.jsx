function CashFlowSummary({
  netIncome,
  totalExpenses,
  disposableIncome,
  animationOrder = 0,
}) {
  const expenseRatio = netIncome > 0 ? (totalExpenses / netIncome) * 100 : 0
  const isOverBudget = disposableIncome < 0
  const isHighSpend = expenseRatio >= 80

  return (
    <div
      className="glass-card cashflow-summary-strip animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="stat-label mb-0">Budget Summary</h6>
          {isHighSpend && !isOverBudget && (
            <span
              className="badge rounded-pill bg-warning text-dark"
              style={{ fontSize: '0.7rem' }}
            >
              ⚠️ High Spending
            </span>
          )}
          {isOverBudget && (
            <span
              className="badge rounded-pill bg-danger"
              style={{ fontSize: '0.7rem' }}
            >
              🚨 Over Budget
            </span>
          )}
        </div>

        {/* ── Three-column stats ── */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="summary-stat-card summary-stat-card--income rounded-3 p-3 text-center">
              <div className="text-muted small mb-1">Net Income</div>
              <div className="stat-value-sm text-success">
                RM {(netIncome ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="summary-stat-card summary-stat-card--expense rounded-3 p-3 text-center">
              <div className="text-muted small mb-1">Total Expenses</div>
              <div className="stat-value-sm text-danger">
                RM {(totalExpenses ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className={`summary-stat-card summary-stat-card--disposable rounded-3 p-3 text-center ${
                !isOverBudget ? 'animate-pulse-glow' : ''
              }`}
            >
              <div className="text-muted small mb-1">Disposable Income</div>
              <div className={`stat-value-sm ${isOverBudget ? 'text-danger' : 'text-primary'}`}>
                RM {(disposableIncome ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div>
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Expense Ratio</span>
            <span>{Math.min(expenseRatio, 100).toFixed(1)}%</span>
          </div>
          <div className="progress" style={{ height: 10 }}>
            <div
              className={`progress-bar ${
                isOverBudget
                  ? 'bg-danger'
                  : isHighSpend
                    ? 'bg-warning'
                    : 'bg-success'
              }`}
              role="progressbar"
              style={{
                width: `${Math.min(expenseRatio, 100)}%`,
                transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              aria-valuenow={Math.min(expenseRatio, 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashFlowSummary
