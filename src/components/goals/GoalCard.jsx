import { useState, useRef, useEffect } from 'react'

/**
 * Generates smart suggested amounts based on the goal's target and remaining.
 * Returns 3 rounded suggestions scaled to the goal size.
 */
function getSuggestions(targetAmount, remaining) {
  if (remaining <= 0) return []

  const raw = [
    targetAmount * 0.05,  // 5% of target
    targetAmount * 0.10,  // 10% of target
    targetAmount * 0.25,  // 25% of target
  ]

  // Round to nice numbers and cap at remaining
  const rounded = raw.map((val) => {
    if (val >= 1000) return Math.round(val / 100) * 100
    if (val >= 100) return Math.round(val / 50) * 50
    if (val >= 10) return Math.round(val / 10) * 10
    return Math.round(val)
  })

  // Filter: positive, unique, and doesn't exceed remaining
  const unique = [...new Set(rounded)].filter((v) => v > 0 && v <= remaining)
  return unique.slice(0, 3)
}

/**
 * Individual goal display card with progress bar, monthly saving badge,
 * months remaining, quick-save panel, and edit/delete action buttons.
 */
function GoalCard({ goal, animationOrder = 0, onEdit, onDelete, onQuickSave }) {
  const {
    _id,
    title,
    targetAmount,
    savedAmount,
    targetDate,
    progressPercent,
    requiredMonthlySaving,
    monthsRemaining,
    remaining,
    isCompleted,
  } = goal

  const [showQuickSave, setShowQuickSave] = useState(false)
  const [quickAmount, setQuickAmount] = useState('')
  const inputRef = useRef(null)
  const panelRef = useRef(null)

  const formattedDate = new Date(targetDate).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Color-coded progress: green ≥66%, yellow ≥33%, blue <33%
  function getProgressColor(percent) {
    if (percent >= 66) return 'bg-success'
    if (percent >= 33) return 'bg-warning'
    return 'bg-primary'
  }

  // Focus input when panel opens
  useEffect(() => {
    if (showQuickSave && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showQuickSave])

  // Close on outside click
  useEffect(() => {
    if (!showQuickSave) return
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowQuickSave(false)
        setQuickAmount('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showQuickSave])

  const suggestions = getSuggestions(targetAmount, remaining)

  const handleQuickSaveSubmit = () => {
    const amount = parseFloat(quickAmount)
    if (!amount || amount <= 0) return
    const newSaved = Math.min(savedAmount + amount, targetAmount)
    onQuickSave?.(_id, newSaved)
    setShowQuickSave(false)
    setQuickAmount('')
  }

  const handleSuggestionClick = (amount) => {
    const newSaved = Math.min(savedAmount + amount, targetAmount)
    onQuickSave?.(_id, newSaved)
    setShowQuickSave(false)
    setQuickAmount('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleQuickSaveSubmit()
    if (e.key === 'Escape') {
      setShowQuickSave(false)
      setQuickAmount('')
    }
  }

  const cardClass = `goal-card animate-fade-in-up${isCompleted ? ' goal-card--completed' : ''}`

  return (
    <div
      className={cardClass}
      style={{ '--animation-order': animationOrder }}
    >
      <div className="goal-card__body">
        {/* Title & Date */}
        <h5 className="goal-card__title">{title}</h5>
        <p className="goal-card__date">
          🎯 Target: {formattedDate}
        </p>

        {/* Saved / Target amounts */}
        <div className="goal-card__amounts">
          <span className="goal-card__saved">
            RM {savedAmount.toLocaleString()}
          </span>
          <span className="goal-card__target">
            / RM {targetAmount.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="goal-card__progress">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small fw-medium">Progress</span>
            <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{progressPercent}%</span>
          </div>
          <div className="progress" style={{ height: '8px', borderRadius: '1rem', overflow: 'hidden' }}>
            <div
              className={`progress-bar ${getProgressColor(progressPercent)}`}
              role="progressbar"
              style={{ width: `${progressPercent}%`, transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Footer: badges + actions */}
        <div className="goal-card__footer">
          <div className="d-flex flex-wrap gap-2">
            {isCompleted ? (
              <span className="goal-badge goal-badge--completed">
                ✅ Goal Reached
              </span>
            ) : (
              <>
                <span className="goal-badge goal-badge--monthly">
                  💰 RM {requiredMonthlySaving.toLocaleString()}/mo
                </span>
                <span className="goal-badge goal-badge--remaining">
                  📅 {monthsRemaining} mo left
                </span>
              </>
            )}
          </div>

          <div className="goal-card__actions">
            {/* Quick Save button */}
            {!isCompleted && (
              <button
                className="goal-action-btn goal-action-btn--save"
                onClick={() => setShowQuickSave(!showQuickSave)}
                aria-label={`Add savings to ${title}`}
                title="Quick add savings"
              >
                💵
              </button>
            )}
            <button
              className="goal-action-btn"
              onClick={() => onEdit?.(goal)}
              aria-label={`Edit ${title}`}
              title="Edit goal"
            >
              ✏️
            </button>
            <button
              className="goal-action-btn goal-action-btn--danger"
              onClick={() => onDelete?.(goal)}
              aria-label={`Delete ${title}`}
              title="Delete goal"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Quick Save Panel */}
        {showQuickSave && (
          <div className="quick-save" ref={panelRef}>
            <div className="quick-save__header">
              <span className="quick-save__label">💵 Add Savings</span>
              <span className="text-muted small">
                RM {remaining.toLocaleString()} remaining
              </span>
            </div>

            <div className="quick-save__input-row">
              <div className="input-group input-group-sm">
                <span className="input-group-text">RM</span>
                <input
                  ref={inputRef}
                  type="number"
                  className="form-control"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  max={remaining}
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Savings amount"
                />
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleQuickSaveSubmit}
                  disabled={!quickAmount || parseFloat(quickAmount) <= 0}
                >
                  Save
                </button>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="quick-save__suggestions">
                <span className="quick-save__suggest-label">Suggested:</span>
                {suggestions.map((amount) => (
                  <button
                    key={amount}
                    className="quick-save__chip"
                    onClick={() => handleSuggestionClick(amount)}
                  >
                    + RM {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GoalCard
