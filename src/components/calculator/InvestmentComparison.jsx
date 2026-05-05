import { useState, useEffect } from 'react'

const DEFAULT_VEHICLES = [
  { id: 'fd', name: 'Fixed Deposit', defaultRate: 3.5, icon: 'bi-safe2', color: 'primary' },
  { id: 'ut', name: 'Unit Trust', defaultRate: 6.0, icon: 'bi-briefcase', color: 'info' },
  { id: 'if', name: 'Index Fund', defaultRate: 8.0, icon: 'bi-graph-up-arrow', color: 'success' },
]

function calculateCompoundInterest(principal, ratePercent, years, compoundingFrequency) {
  const r = ratePercent / 100
  const n = compoundingFrequency
  const t = years
  const amount = principal * Math.pow(1 + r / n, n * t)
  return amount
}

function InvestmentComparison({ hasCalculated, principal, years, compounding, animationOrder = 2 }) {
  const [rates, setRates] = useState({
    fd: DEFAULT_VEHICLES[0].defaultRate,
    ut: DEFAULT_VEHICLES[1].defaultRate,
    if: DEFAULT_VEHICLES[2].defaultRate,
  })

  // Calculate values for each vehicle
  const results = DEFAULT_VEHICLES.map(vehicle => {
    const rate = rates[vehicle.id]
    const futureValue = hasCalculated 
      ? calculateCompoundInterest(principal, rate, years, compounding)
      : 0
    const profit = futureValue - principal
    const roi = principal > 0 ? (profit / principal) * 100 : 0

    return { ...vehicle, rate, futureValue, profit, roi }
  })

  // Find the winner
  const bestVehicleId = hasCalculated && results.length > 0
    ? results.reduce((best, current) => current.futureValue > best.futureValue ? current : best).id
    : null

  const handleRateChange = (id, newRateStr) => {
    const newRate = parseFloat(newRateStr)
    setRates(prev => ({ ...prev, [id]: isNaN(newRate) ? 0 : newRate }))
  }

  return (
    <div className="glass-card mt-4 animate-fade-in-up" style={{ '--animation-order': animationOrder }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="stat-label mb-0">
            <i className="bi bi-layout-three-columns me-1" />
            Investment Comparison
          </h6>
          <span className="badge rounded-pill bg-light text-dark border">
            Based on {years || 0} years
          </span>
        </div>

        {!hasCalculated ? (
          <div className="text-center text-muted py-4">
            Calculate your custom ROI first to unlock comparisons.
          </div>
        ) : (
          <div className="row g-4">
            {results.map(res => (
              <div key={res.id} className="col-md-4">
                <div className={`p-3 rounded-4 border position-relative ${bestVehicleId === res.id ? 'border-primary shadow-sm bg-primary bg-opacity-10' : 'bg-body'}`}>
                  {bestVehicleId === res.id && (
                    <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary">
                      Highest Return
                    </span>
                  )}
                  
                  <div className="d-flex align-items-center gap-2 mb-3 mt-2">
                    <div className={`text-${res.color} bg-${res.color} bg-opacity-10 rounded p-2 d-flex align-items-center justify-content-center`} style={{ width: 36, height: 36 }}>
                      <i className={`bi ${res.icon}`} />
                    </div>
                    <span className="fw-semibold flex-grow-1">{res.name}</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted mb-1">Annual Rate (%)</label>
                    <div className="input-group input-group-sm">
                      <input
                        type="number"
                        step="0.1"
                        className="form-control text-end"
                        value={res.rate === 0 ? '' : res.rate}
                        onChange={(e) => handleRateChange(res.id, e.target.value)}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Future Value</span>
                    <span className="fw-semibold">RM {res.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Total ROI</span>
                    <span className={`fw-semibold ${res.roi > 0 ? 'text-success' : ''}`}>{res.roi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InvestmentComparison
