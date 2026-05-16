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
    updateIncome(0)
    setTimeout(() => {
      incomeRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="cashflow-page">
        <div className="row g-4">
          <div className="col-12"><SkeletonCard lines={3} /></div>
          <div className="col-lg-5"><SkeletonCard lines={3} /></div>
          <div className="col-lg-7"><SkeletonCard lines={5} /></div>
        </div>
      </div>
    )
  }

  if (isEmptyState) {
    return (
      <div className="cashflow-page">
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
          <CashFlowEmptyState onGetStarted={handleGetStarted} />
        </div>
      </div>
    )
  }

  return (
    <div className="cashflow-page">
      <CashFlowSummary
        netIncome={data?.netIncome}
        totalExpenses={totalExpenses}
        disposableIncome={disposableIncome}
        animationOrder={0}
      />

      <div className="row g-4 mt-1">
        <div className="col-lg-5" ref={incomeRef}>
          <IncomeCard
            netIncome={data?.netIncome}
            onSave={updateIncome}
            isSaving={isUpdatingIncome}
            animationOrder={1}
          />
        </div>
        <div className="col-lg-7">
          <ExpenseTracker
            expenses={data?.expenses ?? []}
            onAdd={addExpense}
            onRemove={removeExpense}
            isAdding={isAddingExpense}
            animationOrder={2}
          />
        </div>
      </div>
    </div>
  )
}

export default CashFlowPage
