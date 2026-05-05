function SkeletonCard({ lines = 3 }) {
  const widths = ['75%', '50%', '90%', '60%', '80%', '45%', '70%', '55%']

  return (
    <div className="glass-card h-100">
      <div className="card-body">
        <div className="placeholder-glow">
          <span className="placeholder col-4 mb-3" style={{ height: '0.75rem' }} />
          {Array.from({ length: lines }, (_, i) => (
            <span
              key={i}
              className="placeholder d-block mb-2"
              style={{ width: widths[i % widths.length], height: '0.875rem' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard
