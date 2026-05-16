import { useMemo, useState } from 'react'
import CURRENCY_CONFIG, { CURRENCY_OPTIONS } from '../../utils/currencies'

function formatConverted(value, config) {
  if (value === null || value === undefined || isNaN(value)) return '\u2014'
  if (Math.abs(value) >= 1000000) {
    return `${config.prefix}${(value / 1000000).toFixed(2)}M`
  }
  const decimals = config.code === 'JPY' ? 0 : 2
  return `${config.prefix}${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

function CurrencyConverterCard({ rates, animationOrder = 0 }) {
  const [amount, setAmount] = useState('1')
  const [sourceCurrency, setSourceCurrency] = useState('usd')

  const parsedAmount = parseFloat(amount) || 0

  const conversions = useMemo(() => {
    if (!rates || !rates[sourceCurrency]) return null
    const sourceRate = rates[sourceCurrency]
    return Object.entries(CURRENCY_CONFIG)
      .filter(([key]) => key !== sourceCurrency)
      .map(([key, config]) => {
        const targetRate = rates[key]
        const converted = parsedAmount * (targetRate / sourceRate)
        return { key, config, converted }
      })
  }, [rates, sourceCurrency, parsedAmount])

  const isLoading = !rates

  if (isLoading) {
    return (
      <div
        className="glass-card h-100 animate-fade-in-up"
        style={{ '--animation-order': animationOrder }}
      >
        <div className="card-body">
          <h6 className="stat-label mb-3">Currency Converter</h6>
          <div className="placeholder-glow">
            <span className="placeholder col-8 mb-3" style={{ height: '2.2rem' }} />
            <span className="placeholder col-6 mb-2" style={{ height: '1.8rem' }} />
            <span className="placeholder col-10 mb-2" style={{ height: '1.8rem' }} />
            <span className="placeholder col-7 mb-2" style={{ height: '1.8rem' }} />
            <span className="placeholder col-9" style={{ height: '1.8rem' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="glass-card h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <h6 className="stat-label mb-1">Currency Converter</h6>
        <p className="text-muted small mb-3">Live rates powered by CoinGecko</p>

        <div className="d-flex gap-2 mb-3">
          <input
            type="number"
            className="form-control form-control-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            min="0"
            step="any"
            aria-label="Amount to convert"
          />
          <select
            className="form-select form-select-sm"
            value={sourceCurrency}
            onChange={(e) => setSourceCurrency(e.target.value)}
            aria-label="Source currency"
            style={{ maxWidth: 140 }}
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {conversions && (
          <div className="d-flex flex-column gap-2">
            {conversions.map(({ key, config, converted }) => (
              <div
                key={key}
                className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3"
                style={{ background: 'var(--bs-tertiary-bg, rgba(0,0,0,0.04))' }}
              >
                <span className="small fw-medium">
                  {config.flag} {config.code}
                </span>
                <span className="fw-semibold">
                  {formatConverted(converted, config)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CurrencyConverterCard
