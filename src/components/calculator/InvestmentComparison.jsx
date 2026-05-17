import { useState } from 'react'
import GlassCard from '../ui/GlassCard'
import SliderInput from '../ui/SliderInput'

const DEFAULT_VEHICLES = [
  { id: 'fd', name: 'Fixed Deposit', defaultRate: 3.5, icon: 'bi-safe2', color: 'primary' },
  { id: 'ut', name: 'Unit Trust', defaultRate: 6.0, icon: 'bi-briefcase', color: 'info' },
  { id: 'if', name: 'Index Fund', defaultRate: 8.0, icon: 'bi-graph-up-arrow', color: 'success' },
]

function calculateCompoundInterest(principal, ratePercent, years, compoundingFrequency) {
  const r = ratePercent / 100
  const n = compoundingFrequency
  const t = years
  return principal * Math.pow(1 + r / n, n * t)
}

function InvestmentComparison({ hasCalculated, principal, years, compounding, animationOrder = 2 }) {
  const [rates, setRates] = useState({
    fd: DEFAULT_VEHICLES[0].defaultRate,
    ut: DEFAULT_VEHICLES[1].defaultRate,
    if: DEFAULT_VEHICLES[2].defaultRate,
  })

  // calculate future value, profit, and ROI for each vehicle
  // recalculate when rate or years or principal or compounding changes
  const results = DEFAULT_VEHICLES.map(vehicle => {
    const rate = rates[vehicle.id]
    // make sure principal and years are valid numbers
    const validPrincipal = Number(principal) || 0
    const validYears = Number(years) || 0
    
    const futureValue = calculateCompoundInterest(validPrincipal, rate, validYears, compounding)
    const profit = futureValue - validPrincipal
    const roi = validPrincipal > 0 ? (profit / validPrincipal) * 100 : 0

    return { ...vehicle, rate, futureValue, profit, roi }
  })

  // determine which investment option provides the highest return
  const bestVehicleId = results.length > 0 && Number(principal) > 0
    ? results.reduce((best, current) => current.futureValue > best.futureValue ? current : best).id
    : null

  const handleRateChange = (id, newRate) => {
    setRates(prev => ({ ...prev, [id]: Number(newRate) }))
  }

  return (
    <GlassCard className="mt-4" animationOrder={animationOrder}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="stat-label mb-0">
          <i className="bi bi-layout-three-columns me-1" />
          Investment Comparison
        </h6>
        <span className="badge rounded-pill" style={{ background: 'var(--bs-primary)', color: '#fff', fontSize: '0.75rem' }}>
          Based on {years || 0} years
        </span>
      </div>

      <div className="row g-4">
        {results.map(res => (
          <div key={res.id} className="col-md-4">
            <div 
              className="p-4 rounded-4 position-relative" 
              style={{
                // highlight the best investment option if any
                background: bestVehicleId === res.id ? 'var(--nav-active-bg)' : 'rgba(150, 150, 150, 0.05)',
                border: bestVehicleId === res.id ? '1px solid var(--bs-primary)' : '1px solid rgba(150, 150, 150, 0.1)',
                boxShadow: bestVehicleId === res.id ? '0 8px 24px rgba(37,99,235,0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {bestVehicleId === res.id && (
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary shadow-sm px-3 py-2">
                  Highest Return
                </span>
              )}
              
              <div className="d-flex align-items-center gap-3 mb-4 mt-2">
                <div className={`text-${res.color} bg-${res.color} bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48, fontSize: '1.5rem' }}>
                  <i className={`bi ${res.icon}`} />
                </div>
                <span className="fw-bold fs-5">{res.name}</span>
              </div>

              {/* rate slider */}
              <div className="mb-4">
                <SliderInput
                  label="Expected Annual Rate"
                  value={res.rate}
                  onChange={(val) => handleRateChange(res.id, val)}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
              </div>

              {/* show future value and total roi */}
              <div className="pt-3 border-top" style={{ borderColor: 'rgba(150,150,150,0.1)' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Future Value</span>
                  <span className="fw-bold text-primary">RM {res.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Total ROI</span>
                  <span className={`fw-bold ${res.roi > 0 ? 'text-success' : ''}`}>
                    {res.roi > 0 ? '+' : ''}{res.roi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

export default InvestmentComparison