import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useMarketChart } from '../../hooks/useMarketChart'
import SegmentedControl from '../ui/SegmentedControl'
import useThemeStore from '../../stores/useThemeStore'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const TIMEFRAMES = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
]

const CURRENCY_SYMBOLS = {
  usd: '$',
  eur: '\u20ac',
  gbp: '\u00a3',
  jpy: '\u00a5',
  myr: 'RM',
}

const CURRENCY_LABELS = {
  usd: 'USD',
  eur: 'EUR',
  gbp: 'GBP',
  jpy: 'JPY',
  myr: 'MYR',
}

const getCssVar = (name, fallback) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

const toRgba = (color, alpha) => {
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\(([^)]+),\s*[^)]+\)/, `rgba($1, ${alpha})`)
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
  }
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    const normalized =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    const bigint = parseInt(normalized, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return color
}

function CryptoChart({ coinId = 'bitcoin', currency = 'usd' }) {
  const [timeframe, setTimeframe] = useState('30d')
  const { data, isLoading, isError } = useMarketChart(coinId, timeframe, currency)
  const theme = useThemeStore((state) => state.theme)
  const chartRef = useRef(null)

  const sym = CURRENCY_SYMBOLS[currency] || '$'
  const currencyLabel = CURRENCY_LABELS[currency] || 'USD'

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [])

  const prices = data?.prices ?? []
  const currentPrice = prices.at(-1)?.[1] ?? 0
  const prevPrice = prices.at(-2)?.[1] ?? currentPrice
  const priceChange = currentPrice - prevPrice
  const changePercent = prevPrice ? (priceChange / prevPrice) * 100 : 0
  const isPositive = priceChange >= 0

  const formatPrice = (val) => {
    if (!val) return '\u2014'
    const prefix = sym === 'RM' ? 'RM ' : sym
    return `${prefix}${val.toLocaleString()}`
  }

  const chartData = useMemo(() => {
    if (!prices.length) return null

    const labels = prices.map(([ts]) =>
      new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )

    const lineColor = getCssVar(
      isPositive ? '--bs-success' : '--bs-danger',
      isPositive ? '#10b981' : '#ef4444'
    )

    return {
      labels,
      datasets: [
        {
          label: `BTC Price (${currencyLabel})`,
          data: prices.map(([, p]) => p),
          borderColor: lineColor,
          backgroundColor: toRgba(lineColor, 0.12),
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: lineColor,
          borderWidth: 2.5,
        },
      ],
    }
  }, [prices, isPositive, theme, currencyLabel])

  const options = useMemo(() => {
    const isDark = theme === 'dark'
    const textColor = getCssVar('--bs-body-color', isDark ? '#f8fafc' : '#0f172a')
    const mutedColor = getCssVar('--bs-secondary-color', '#64748b')
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'

    const prefix = sym === 'RM' ? 'RM ' : sym

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          titleColor: textColor,
          bodyColor: mutedColor,
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.06)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            label: (ctx) => `${prefix}${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: mutedColor,
            maxTicksLimit: 8,
            font: { size: 11, family: 'Inter' },
          },
        },
        y: {
          grid: { color: gridColor },
          border: { display: false },
          ticks: {
            color: mutedColor,
            font: { size: 11, family: 'Inter' },
            callback: (v) => `${prefix}${(v / 1000).toFixed(0)}k`,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    }
  }, [theme, sym])

  return (
    <div className="glass-card h-100 animate-fade-in-up" style={{ '--animation-order': 1 }}>
      <div className="card-body">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
          <div>
            <h6 className="stat-label mb-1">Crypto Market Trends</h6>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold">Bitcoin (BTC)</span>
              <span className="badge text-bg-primary-subtle">{currencyLabel}</span>
            </div>
          </div>

          <div className="text-lg-end">
            <div className="stat-value-sm">
              {formatPrice(currentPrice)}
            </div>
            <span
              className={`fw-semibold ${isPositive ? 'text-success' : 'text-danger'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {isPositive ? '\u25b2' : '\u25bc'} {Math.abs(priceChange).toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="mb-3">
          <SegmentedControl
            options={TIMEFRAMES}
            value={timeframe}
            onChange={setTimeframe}
          />
        </div>

        {isLoading && (
          <div className="placeholder-glow" style={{ minHeight: 280 }}>
            <span className="placeholder col-6 mb-3" style={{ height: '0.8rem' }} />
            <span className="placeholder d-block" style={{ height: '260px' }} />
          </div>
        )}

        {isError && !isLoading && (
          <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: 280 }}>
            <div className="fs-2 mb-2">{'\u26a0\ufe0f'}</div>
            <h6 className="fw-semibold mb-2">Market data unavailable</h6>
            <p className="text-muted small mb-0">Please try again in a moment.</p>
          </div>
        )}

        {!isLoading && !isError && chartData && (
          <div className="chart-container" style={{ height: 300 }}>
            <Line ref={chartRef} data={chartData} options={options} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CryptoChart
