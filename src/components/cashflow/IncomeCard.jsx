import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { incomeSchema } from '../../schemas/cashflow.schema'

function IncomeCard({ netIncome, onSave, isSaving, animationOrder = 0 }) {
  const [editing, setEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: { netIncome: netIncome || '' },
  })

  const onSubmit = (values) => {
    onSave(values.netIncome)
    setEditing(false)
  }

  const handleEdit = () => {
    reset({ netIncome: netIncome || '' })
    setEditing(true)
  }

  const handleCancel = () => {
    reset({ netIncome: netIncome || '' })
    setEditing(false)
  }

  return (
    <div
      className="glass-card h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="stat-label mb-0">Monthly Net Income</h6>
          {!editing && (
            <button
              id="income-edit-btn"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={handleEdit}
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {!editing ? (
          /* ── Display Mode ── */
          <div className="income-display mt-auto">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 p-3"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                minHeight: 100,
              }}
            >
              <div className="text-center">
                <div className="text-muted small mb-1">Current Income</div>
                <div className="stat-value text-success">
                  RM {(netIncome ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-muted small mt-2 text-center">
              After tax, per month
            </div>
          </div>
        ) : (
          /* ── Edit Mode ── */
          <form onSubmit={handleSubmit(onSubmit)} className="income-edit-form mt-2">
            <label htmlFor="income-input" className="form-label small fw-semibold">
              Net Income (RM)
            </label>
            <div className="input-group mb-2">
              <span className="input-group-text">RM</span>
              <input
                id="income-input"
                type="number"
                step="0.01"
                className={`form-control form-control-lg ${errors.netIncome ? 'is-invalid' : ''}`}
                placeholder="e.g. 8500"
                autoFocus
                {...register('netIncome')}
              />
            </div>
            {errors.netIncome && (
              <div className="text-danger small mb-2">{errors.netIncome.message}</div>
            )}

            <div className="d-flex gap-2 mt-3">
              <button
                id="income-save-btn"
                type="submit"
                className="btn btn-primary rounded-pill px-4"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="spinner-border spinner-border-sm me-1" />
                ) : null}
                Save
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default IncomeCard
