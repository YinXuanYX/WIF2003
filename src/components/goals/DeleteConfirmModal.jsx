import { useEffect, useRef } from 'react'

/**
 * Confirmation dialog before deleting a goal.
 *
 * @param {boolean} show - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {function} onConfirm - Confirm delete handler
 * @param {object|null} goal - Goal to delete
 */
function DeleteConfirmModal({ show, onClose, onConfirm, goal }) {
  const backdropRef = useRef(null)

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && show) onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [show, onClose])

  const handleConfirm = () => {
    onConfirm(goal.id)
    onClose()
  }

  if (!show || !goal) return null

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
        aria-labelledby="deleteConfirmLabel"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content animate-scale-in" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            {/* Header */}
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold" id="deleteConfirmLabel">
                🗑️ Delete Goal
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              <p className="mb-1">
                Are you sure you want to delete{' '}
                <strong>{goal.title}</strong>?
              </p>
              <p className="text-muted small mb-0">
                This action cannot be undone. All progress data for this goal will be permanently removed.
              </p>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm fw-semibold"
                onClick={handleConfirm}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteConfirmModal
