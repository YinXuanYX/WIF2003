import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { calculatorSchema } from '../../schemas/calculator.schema'
import GlassCard from '../ui/GlassCard'
import SegmentedControl from '../ui/SegmentedControl'
import SliderInput from '../ui/SliderInput'

function ROIForm({ defaultValues, onChange, goals = [], disposableIncome = 0 }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calculatorSchema),
    defaultValues,
    mode: 'onChange'
  })

  // Watch all values to trigger reactive updates
  const values = watch()

  // Notify parent component instantly when inputs are valid
  useEffect(() => {
    // Basic validation check before pushing to parent
    if (
      values.principal !== '' && !isNaN(values.principal) &&
      values.rate !== '' && !isNaN(values.rate) &&
      values.years !== '' && !isNaN(values.years)
    ) {
      onChange(values)
    }
  }, [values, onChange])

  const handleFillGoal = (goal) => {
    const amountNeeded = Math.max(0, goal.targetAmount - goal.savedAmount)
    setValue('principal', amountNeeded, { shouldValidate: true })
  }

  return (
    <GlassCard className="h-100" animationOrder={0}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="stat-label mb-0">
          <i className="bi bi-sliders me-1" />
          Investment Details
        </h6>
        {disposableIncome > 0 && (
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2" style={{ fontSize: '0.7rem' }}>
            Disposable: RM {disposableIncome.toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex-grow-1 d-flex flex-column gap-4">
        <div>
          <div className="d-flex justify-content-end mb-1">
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
          <SliderInput
            label="Principal (RM)"
            value={values.principal}
            onChange={(val) => setValue('principal', val === '' ? '' : Number(val), { shouldValidate: true })}
            min={0}
            max={500000}
            step={1000}
            prefix="RM"
          />
          {errors.principal && <div className="text-danger small mt-1">{errors.principal.message}</div>}
        </div>

        <div>
          <SliderInput
            label="Annual Rate (%)"
            value={values.rate}
            onChange={(val) => setValue('rate', val === '' ? '' : Number(val), { shouldValidate: true })}
            min={0}
            max={20}
            step={0.1}
            suffix="%"
          />
          {errors.rate && <div className="text-danger small mt-1">{errors.rate.message}</div>}
        </div>

        <div>
          <SliderInput
            label="Time (Years)"
            value={values.years}
            onChange={(val) => setValue('years', val === '' ? '' : Number(val), { shouldValidate: true })}
            min={1}
            max={40}
            step={1}
            suffix="Y"
          />
          {errors.years && <div className="text-danger small mt-1">{errors.years.message}</div>}
        </div>

        <div>
          <label className="form-label small fw-semibold mb-2">Compounding Frequency</label>
          <SegmentedControl
            options={[
              { label: 'Annually', value: 1 },
              { label: 'Quarterly', value: 4 },
              { label: 'Monthly', value: 12 },
              { label: 'Daily', value: 365 },
            ]}
            value={Number(values.compounding) || 1}
            onChange={(val) => setValue('compounding', val, { shouldValidate: true })}
          />
          {errors.compounding && <div className="text-danger small mt-1">{errors.compounding.message}</div>}
        </div>
      </div>
    </GlassCard>
  )
}

export default ROIForm
