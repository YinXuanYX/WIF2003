function CashFlowSummary({ netIncome, totalExpenses, disposableIncome, animationOrder = 0 }) {
  const expenseRatio = netIncome > 0 ? (totalExpenses / netIncome) * 100 : 0
  const isOverBudget = disposableIncome < 0
  const isHighSpend = expenseRatio >= 80

  return (
    <div
      className="cashflow-hero animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="cashflow-hero__cards">
        <div className="cashflow-hero__card cashflow-hero__card--income">
          <div className="cashflow-hero__icon">
            <i className="bi bi-arrow-down-circle" />
          </div>
          <div>
            <div className="cashflow-hero__label">Net Income</div>
            <div className="cashflow-hero__value text-success">
              RM {(netIncome ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="cashflow-hero__card cashflow-hero__card--expense">
          <div className="cashflow-hero__icon cashflow-hero__icon--danger">
            <i className="bi bi-arrow-up-circle" />
          </div>
          <div>
            <div className="cashflow-hero__label">Total Expenses</div>
            <div className="cashflow-hero__value text-danger">
              RM {(totalExpenses ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className={`cashflow-hero__card cashflow-hero__card--disposable ${!isOverBudget ? 'cashflow-hero__card--glow' : ''}`}>
          <div className={`cashflow-hero__icon ${isOverBudget ? 'cashflow-hero__icon--danger' : 'cashflow-hero__icon--primary'}`}>
            <i className="bi bi-wallet2" />
          </div>
          <div>
            <div className="cashflow-hero__label">
              Disposable Income
              {isHighSpend && !isOverBudget && (
                <span className="badge rounded-pill bg-warning text-dark ms-2" style={{ fontSize: '0.625rem' }}>
                  High Spending
                </span>
              )}
              {isOverBudget && (
                <span className="badge rounded-pill bg-danger ms-2" style={{ fontSize: '0.625rem' }}>
                  Over Budget
                </span>
              )}
            </div>
            <div className={`cashflow-hero__value ${isOverBudget ? 'text-danger' : 'text-primary'}`}>
              RM {(disposableIncome ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="cashflow-hero__progress">
        <div className="d-flex justify-content-between small text-muted mb-1">
          <span>Budget Used</span>
          <span className="fw-semibold">{Math.min(expenseRatio, 100).toFixed(1)}%</span>
        </div>
        <div className="progress" style={{ height: 6 }}>
          <div
            className={`progress-bar ${isOverBudget ? 'bg-danger' : isHighSpend ? 'bg-warning' : 'bg-success'}`}
            role="progressbar"
            style={{
              width: `${Math.min(expenseRatio, 100)}%`,
              transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
              borderRadius: '1rem',
            }}
            aria-valuenow={Math.min(expenseRatio, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  )
}

export default CashFlowSummary
