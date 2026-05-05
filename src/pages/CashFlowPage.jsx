import { useRef } from 'react'
import { useCashFlow } from '../hooks/useCashFlow'
import CashFlowEmptyState from '../components/cashflow/CashFlowEmptyState'
import IncomeCard from '../components/cashflow/IncomeCard'
import ExpenseTracker from '../components/cashflow/ExpenseTracker'
import CashFlowSummary from '../components/cashflow/CashFlowSummary'
import SkeletonCard from '../components/dashboard/SkeletonCard'

function CashFlowPage() {
  const {
    data,
    isLoading,
    totalExpenses,
    disposableIncome,
    isEmptyState,
    updateIncome,
    isUpdatingIncome,
    addExpense,
    isAddingExpense,
    removeExpense,
  } = useCashFlow()

  const incomeRef = useRef(null)

  const handleGetStarted = () => {
    // Force a fake income to exit the empty state, then focus the editor
    updateIncome(0.01)
    setTimeout(() => {
      incomeRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // ── Skeleton loading ──
  if (isLoading) {
    return (
      <>
        <div className="dashboard-greeting mb-4 animate-fade-in-up">
          <div className="placeholder-glow">
            <span className="placeholder col-4" style={{ height: '1.5rem' }} />
            <span className="placeholder col-6 d-block mt-2" style={{ height: '0.875rem' }} />
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-4"><SkeletonCard lines={3} /></div>
          <div className="col-lg-8"><SkeletonCard lines={5} /></div>
          <div className="col-12"><SkeletonCard lines={3} /></div>
        </div>
      </>
    )
  }

  // ── Empty state ──
  if (isEmptyState) {
    return (
      <div className="cashflow-page">
        <div className="dashboard-greeting mb-4 animate-fade-in-up">
          <h1>Cash Flow & Budget Baseline</h1>
          <p>Establish your financial baseline to power smarter planning.</p>
        </div>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
          <CashFlowEmptyState onGetStarted={handleGetStarted} />
        </div>
      </div>
    )
  }

  // ── Main layout ──
  return (
    <div className="cashflow-page">
      <div className="dashboard-greeting mb-4 animate-fade-in-up">
        <h1>Cash Flow & Budget Baseline</h1>
        <p>Manage your income and recurring expenses to track your disposable cash.</p>
      </div>

      <div className="row g-4">
        {/* Income */}
        <div className="col-lg-4" ref={incomeRef}>
          <IncomeCard
            netIncome={data?.netIncome}
            onSave={updateIncome}
            isSaving={isUpdatingIncome}
            animationOrder={0}
          />
        </div>

        {/* Expenses */}
        <div className="col-lg-8">
          <ExpenseTracker
            expenses={data?.expenses ?? []}
            onAdd={addExpense}
            onRemove={removeExpense}
            isAdding={isAddingExpense}
            animationOrder={1}
          />
        </div>

        {/* Summary */}
        <div className="col-12">
          <CashFlowSummary
            netIncome={data?.netIncome}
            totalExpenses={totalExpenses}
            disposableIncome={disposableIncome}
            animationOrder={2}
          />
        </div>
      </div>
    </div>
  )
}

export default CashFlowPage
