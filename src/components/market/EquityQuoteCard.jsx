import { useMemo } from 'react'
import { useEquityQuote } from '../../hooks/useEquityQuote'

const formatPrice = (value) =>
  value === undefined || value === null ? '—' : `$${value.toLocaleString()}`

function EquityQuoteCard({ symbol, name, animationOrder = 0 }) {
  const { data, isLoading, isError, error } = useEquityQuote(symbol)

  const derived = useMemo(() => {
    if (!data) return null
    const change = data.d ?? 0
    const changePercent = data.dp ?? 0
    return {
      isPositive: change >= 0,
      change,
      changePercent,
    }
  }, [data])

  if (isLoading) {
    return (
      <div
        className="glass-card h-100 animate-fade-in-up"
        style={{ '--animation-order': animationOrder }}
      >
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-6 mb-3" style={{ height: '0.8rem' }} />
            <span className="placeholder col-4 mb-2" style={{ height: '1.4rem' }} />
            <span className="placeholder col-8 mb-3" style={{ height: '0.8rem' }} />
            <span className="placeholder col-10" style={{ height: '0.8rem' }} />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    const isRateLimited = error?.status === 429
    return (
      <div
        className="glass-card h-100 animate-fade-in-up"
        style={{ '--animation-order': animationOrder }}
      >
        <div className="card-body d-flex flex-column justify-content-center text-center py-5">
          <div className="fs-2 mb-2">⏳</div>
          <h6 className="fw-semibold mb-2">
            {isRateLimited ? 'Rate limit reached' : 'Quote unavailable'}
          </h6>
          <p className="text-muted small mb-0">
            {isRateLimited
              ? 'Retrying in about 60 seconds.'
              : 'Please try again later.'}
          </p>
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
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="stat-label mb-1">Equity Quote</h6>
            <div className="fw-semibold">
              {name || symbol} <span className="text-muted">({symbol})</span>
            </div>
          </div>
          <div className="text-end">
            <div className="stat-value-sm">{formatPrice(data.c)}</div>
            <span
              className={`fw-semibold ${derived.isPositive ? 'text-success' : 'text-danger'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {derived.isPositive ? '▲' : '▼'} {Math.abs(derived.change).toFixed(2)} ({derived.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="d-grid gap-2">
          <div className="d-flex justify-content-between text-muted small">
            <span>High</span>
            <span className="text-body">{formatPrice(data.h)}</span>
          </div>
          <div className="d-flex justify-content-between text-muted small">
            <span>Low</span>
            <span className="text-body">{formatPrice(data.l)}</span>
          </div>
          <div className="d-flex justify-content-between text-muted small">
            <span>Open</span>
            <span className="text-body">{formatPrice(data.o)}</span>
          </div>
          <div className="d-flex justify-content-between text-muted small">
            <span>Prev Close</span>
            <span className="text-body">{formatPrice(data.pc)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquityQuoteCard
