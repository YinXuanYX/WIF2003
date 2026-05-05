import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { expenseSchema } from '../../schemas/cashflow.schema'

function ExpenseTracker({
  expenses = [],
  onAdd,
  onRemove,
  isAdding,
  animationOrder = 0,
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { label: '', amount: '' },
  })

  const onSubmit = (values) => {
    onAdd(values)
    reset()
  }

  const handleDelete = (id) => {
    if (confirmDeleteId === id) {
      onRemove(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
    }
  }

  return (
    <div
      className="glass-card h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body d-flex flex-column">
        {/* ── Header ── */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="stat-label mb-0">Recurring Expenses</h6>
          <span
            className="badge rounded-pill"
            style={{
              background: 'rgba(var(--bs-primary-rgb, 37,99,235), 0.1)',
              color: 'var(--bs-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {expenses.length} item{expenses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Add Expense Form ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="expense-add-form mb-3"
          id="add-expense-form"
        >
          <div className="row g-2 align-items-start">
            <div className="col">
              <input
                id="expense-label-input"
                type="text"
                className={`form-control ${errors.label ? 'is-invalid' : ''}`}
                placeholder="Expense label"
                {...register('label')}
              />
              {errors.label && (
                <div className="invalid-feedback">{errors.label.message}</div>
              )}
            </div>
            <div className="col-auto" style={{ width: 140 }}>
              <div className="input-group">
                <span className="input-group-text" style={{ fontSize: '0.8rem' }}>
                  RM
                </span>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                  placeholder="0.00"
                  {...register('amount')}
                />
              </div>
              {errors.amount && (
                <div className="text-danger small mt-1">{errors.amount.message}</div>
              )}
            </div>
            <div className="col-auto">
              <button
                id="add-expense-btn"
                type="submit"
                className="btn btn-primary rounded-pill px-3"
                disabled={isAdding}
              >
                {isAdding ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  '+ Add'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ── Expense List ── */}
        <div className="expense-list flex-grow-1" style={{ overflowY: 'auto', maxHeight: 320 }}>
          {expenses.length === 0 ? (
            <div className="text-center text-muted py-4">
              <div className="mb-2" style={{ fontSize: '1.5rem' }}>📭</div>
              <div className="small">No expenses yet. Add your first one above.</div>
            </div>
          ) : (
            expenses.map((expense, i) => (
              <div
                key={expense.id}
                className="expense-row d-flex justify-content-between align-items-center animate-fade-in-up"
                style={{ '--animation-order': i }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="expense-row__dot" />
                  <span className="fw-medium">{expense.label}</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                    RM {expense.amount.toLocaleString()}
                  </span>

                  {confirmDeleteId === expense.id ? (
                    <div className="d-flex align-items-center gap-1 animate-scale-in">
                      <button
                        className="btn btn-sm btn-danger rounded-pill px-2 py-0"
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => handleDelete(expense.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0"
                        style={{ fontSize: '0.7rem' }}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm expense-row__delete"
                      onClick={() => handleDelete(expense.id)}
                      aria-label={`Delete ${expense.label}`}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpenseTracker
