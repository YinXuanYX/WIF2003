/**
 * Skeleton loading state for the Goals page.
 * Renders placeholder cards mimicking GoalCard layout.
 */
function GoalSkeleton({ count = 3 }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="col-lg-4 col-md-6">
          <div className="goal-skeleton">
            <div className="goal-skeleton__body">
              <div className="placeholder-glow">
                {/* Title */}
                <span
                  className="placeholder d-block mb-2"
                  style={{ width: '60%', height: '1rem' }}
                />
                {/* Date */}
                <span
                  className="placeholder d-block mb-3"
                  style={{ width: '40%', height: '0.75rem' }}
                />
                {/* Amounts row */}
                <div className="d-flex justify-content-between mb-2">
                  <span
                    className="placeholder"
                    style={{ width: '35%', height: '1.25rem' }}
                  />
                  <span
                    className="placeholder"
                    style={{ width: '25%', height: '0.875rem' }}
                  />
                </div>
                {/* Progress bar */}
                <span
                  className="placeholder d-block mb-3"
                  style={{ width: '100%', height: '0.625rem', borderRadius: '1rem' }}
                />
                {/* Footer badges */}
                <div className="d-flex justify-content-between">
                  <span
                    className="placeholder"
                    style={{ width: '30%', height: '1.5rem', borderRadius: '2rem' }}
                  />
                  <span
                    className="placeholder"
                    style={{ width: '20%', height: '1.5rem', borderRadius: '2rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default GoalSkeleton
