import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { calculatorSchema } from '../../schemas/calculator.schema'

function ROIForm({ defaultValues, onCalculate, goals = [], disposableIncome = 0 }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calculatorSchema),
    defaultValues,
  })

  const handleFillGoal = (goal) => {
    const amountNeeded = Math.max(0, goal.targetAmount - goal.savedAmount)
    setValue('principal', amountNeeded)
  }

  return (
    <div className="glass-card h-100 animate-fade-in-up" style={{ '--animation-order': 0 }}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="stat-label mb-0">
            <i className="bi bi-sliders me-1" />
            Investment Details
          </h6>
          {disposableIncome > 0 && (
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2">
              Disposable: RM {disposableIncome.toLocaleString()}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onCalculate)} className="flex-grow-1 d-flex flex-column">
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-end mb-1">
              <label className="form-label small fw-semibold mb-0">Principal (Initial Investment)</label>
              {goals.length > 0 && (
                <div className="dropdown">
                  <button className="btn btn-sm btn-link text-decoration-none py-0 px-1 dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{ fontSize: '0.75rem' }}>
                    Auto-fill from Goal
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ fontSize: '0.85rem' }}>
                    {goals.map(goal => {
                      const needed = Math.max(0, goal.targetAmount - goal.savedAmount)
                      return (
                        <li key={goal._id}>
                          <button type="button" className="dropdown-item d-flex justify-content-between" onClick={() => handleFillGoal(goal)}>
                            <span>{goal.title}</span>
                            <span className="text-muted ms-3">RM {needed.toLocaleString()}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="input-group">
              <span className="input-group-text">RM</span>
              <input
                type="number"
                step="0.01"
                className={`form-control ${errors.principal ? 'is-invalid' : ''}`}
                placeholder="e.g. 10000"
                {...register('principal')}
              />
            </div>
            {errors.principal && <div className="text-danger small mt-1">{errors.principal.message}</div>}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Annual Rate (%)</label>
              <div className="input-group">
                <input
                  type="number"
                  step="0.1"
                  className={`form-control ${errors.rate ? 'is-invalid' : ''}`}
                  placeholder="e.g. 5.5"
                  {...register('rate')}
                />
                <span className="input-group-text">%</span>
              </div>
              {errors.rate && <div className="text-danger small mt-1">{errors.rate.message}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Time (Years)</label>
              <input
                type="number"
                step="1"
                className={`form-control ${errors.years ? 'is-invalid' : ''}`}
                placeholder="e.g. 5"
                {...register('years')}
              />
              {errors.years && <div className="text-danger small mt-1">{errors.years.message}</div>}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Compounding Frequency</label>
            <select
              className="form-select"
              {...register('compounding')}
            >
              <option value="1">Annually (1/year)</option>
              <option value="4">Quarterly (4/year)</option>
              <option value="12">Monthly (12/year)</option>
              <option value="365">Daily (365/year)</option>
            </select>
            {errors.compounding && <div className="text-danger small mt-1">{errors.compounding.message}</div>}
          </div>

          <div className="mt-auto pt-2">
            <button type="submit" className="btn btn-primary w-100 rounded-pill">
              <i className="bi bi-calculator me-1" />
              Calculate ROI
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ROIForm
