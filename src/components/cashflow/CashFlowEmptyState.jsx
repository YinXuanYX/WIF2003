function CashFlowEmptyState({ onGetStarted }) {
  return (
    <div className="glass-card cashflow-empty-state animate-scale-in mx-auto" style={{ maxWidth: 560 }}>
      <div className="card-body text-center py-5 px-4">
        <div className="empty-state-icon mb-4">
          <i className="bi bi-wallet2" />
        </div>

        <h3 className="fw-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
          Let's set up your financial baseline
        </h3>

        <p className="text-muted mb-4" style={{ maxWidth: 420, margin: '0 auto' }}>
          Start by entering your monthly net income and recurring expenses.
          We'll calculate your disposable income and help you plan smarter.
        </p>

        <button
          id="cashflow-get-started-btn"
          className="btn btn-primary btn-lg px-4 rounded-pill"
          onClick={onGetStarted}
        >
          Get Started
        </button>

        <div className="mt-4 d-flex justify-content-center gap-4">
          {[
            { icon: 'bi-cash-stack', text: 'Set income' },
            { icon: 'bi-receipt', text: 'Add expenses' },
            { icon: 'bi-pie-chart', text: 'See summary' },
          ].map((step, i) => (
            <div key={i} className="text-muted small d-flex align-items-center gap-1">
              <i className={`bi ${step.icon}`} />
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CashFlowEmptyState
