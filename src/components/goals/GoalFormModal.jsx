import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const goalSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Goal title is required')
      .max(50, 'Title must be 50 characters or less'),
    targetAmount: z
      .number({ invalid_type_error: 'Enter a valid number' })
      .positive('Target amount must be greater than 0'),
    savedAmount: z
      .number({ invalid_type_error: 'Enter a valid number' })
      .min(0, 'Saved amount cannot be negative'),
    targetDate: z.string().min(1, 'Target date is required'),
  })
  .refine(
    (data) => {
      const target = new Date(data.targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return target > today
    },
    {
      message: 'Target date must be in the future',
      path: ['targetDate'],
    }
  )

function GoalFormModal({ show, onClose, onSubmit, editGoal = null }) {
  const isEditMode = Boolean(editGoal)
  const backdropRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(goalSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      targetAmount: '',
      savedAmount: 0,
      targetDate: '',
    },
  })

  // Reset form when modal opens or editGoal changes
  useEffect(() => {
    if (show) {
      if (editGoal) {
        reset({
          title: editGoal.title,
          targetAmount: editGoal.targetAmount,
          savedAmount: editGoal.savedAmount,
          targetDate: editGoal.targetDate?.split('T')[0] || editGoal.targetDate,
        })
      } else {
        reset({
          title: '',
          targetAmount: '',
          savedAmount: 0,
          targetDate: '',
        })
      }
    }
  }, [show, editGoal, reset])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && show) onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [show, onClose])

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      targetAmount: Number(data.targetAmount),
      savedAmount: Number(data.savedAmount),
    })
    onClose()
  }

  if (!show) return null

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        ref={backdropRef}
        onClick={handleBackdropClick}
        aria-labelledby="goalFormModalLabel"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content animate-scale-in" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            {/* Header */}
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold" id="goalFormModalLabel">
                {isEditMode ? '✏️ Edit Goal' : '🎯 New Goal'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="modal-body pt-2">
                {/* Title */}
                <div className="mb-3">
                  <label htmlFor="goal-title" className="form-label fw-semibold small">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    id="goal-title"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="e.g. Emergency Fund"
                    {...register('title')}
                  />
                  {errors.title && (
                    <div className="invalid-feedback d-flex align-items-center gap-1">
                      ⚠️ {errors.title.message}
                    </div>
                  )}
                </div>

                {/* Target Amount */}
                <div className="mb-3">
                  <label htmlFor="goal-target" className="form-label fw-semibold small">
                    Target Amount (RM)
                  </label>
                  <input
                    type="number"
                    id="goal-target"
                    className={`form-control ${errors.targetAmount ? 'is-invalid' : ''}`}
                    placeholder="e.g. 30000"
                    step="0.01"
                    {...register('targetAmount', { valueAsNumber: true })}
                  />
                  {errors.targetAmount && (
                    <div className="invalid-feedback d-flex align-items-center gap-1">
                      ⚠️ {errors.targetAmount.message}
                    </div>
                  )}
                </div>

                {/* Saved Amount */}
                <div className="mb-3">
                  <label htmlFor="goal-saved" className="form-label fw-semibold small">
                    Current Saved Amount (RM)
                  </label>
                  <input
                    type="number"
                    id="goal-saved"
                    className={`form-control ${errors.savedAmount ? 'is-invalid' : ''}`}
                    placeholder="e.g. 5000"
                    step="0.01"
                    {...register('savedAmount', { valueAsNumber: true })}
                  />
                  {errors.savedAmount && (
                    <div className="invalid-feedback d-flex align-items-center gap-1">
                      ⚠️ {errors.savedAmount.message}
                    </div>
                  )}
                </div>

                {/* Target Date */}
                <div className="mb-3">
                  <label htmlFor="goal-date" className="form-label fw-semibold small">
                    Target Date
                  </label>
                  <input
                    type="date"
                    id="goal-date"
                    className={`form-control ${errors.targetDate ? 'is-invalid' : ''}`}
                    {...register('targetDate')}
                  />
                  {errors.targetDate && (
                    <div className="invalid-feedback d-flex align-items-center gap-1">
                      ⚠️ {errors.targetDate.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary fw-semibold"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting
                    ? '⏳ Saving...'
                    : isEditMode
                    ? '💾 Update Goal'
                    : '✨ Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default GoalFormModal
