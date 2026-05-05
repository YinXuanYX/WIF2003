import { useRef, useEffect } from 'react'
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
import useThemeStore from '../../stores/useThemeStore'
import SkeletonCard from './SkeletonCard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

function MarketTrendsCard({ animationOrder = 3 }) {
  const { data, isLoading, isError } = useMarketChart('bitcoin', '30d')
  const theme = useThemeStore((state) => state.theme)
  const chartRef = useRef(null)

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [])

  if (isLoading) return <SkeletonCard lines={8} />

  if (isError || !data?.prices?.length) {
    return (
      <div
        className="glass-card h-100 animate-fade-in-up"
        style={{ '--animation-order': animationOrder }}
      >
        <div className="card-body d-flex flex-column justify-content-center text-center py-5">
          <div className="fs-2 mb-2">📉</div>
          <h6 className="fw-semibold mb-2">Market data unavailable</h6>
          <p className="text-muted small mb-0">
            Please try again later or refresh the page.
          </p>
        </div>
      </div>
    )
  }

  const prices = data.prices
  const currentPrice = prices[prices.length - 1][1]
  const prevPrice = prices[prices.length - 2][1]
  const priceChange = currentPrice - prevPrice
  const changePercent = ((priceChange / prevPrice) * 100).toFixed(2)
  const isPositive = priceChange >= 0

  const labels = prices.map(([ts]) =>
    new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  )

  const isDark = theme === 'dark'

  const chartData = {
    labels,
    datasets: [
      {
        label: 'BTC Price (USD)',
        data: prices.map(([, p]) => p),
        borderColor: isPositive ? '#10b981' : '#ef4444',
        backgroundColor: isPositive
          ? 'rgba(16, 185, 129, 0.06)'
          : 'rgba(239, 68, 68, 0.06)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isPositive ? '#10b981' : '#ef4444',
        borderWidth: 2.5,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark
          ? 'rgba(30, 41, 59, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.06)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: isDark ? '#94a3b8' : '#94a3b8',
          maxTicksLimit: 8,
          font: { size: 11, family: 'Inter' },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        },
        border: { display: false },
        ticks: {
          color: isDark ? '#94a3b8' : '#94a3b8',
          font: { size: 11, family: 'Inter' },
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  return (
    <div
      className="glass-card h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="stat-label mb-1">Market Trends</h6>
            <span className="fw-semibold">Bitcoin (BTC)</span>
          </div>
          <div className="text-end">
            <div className="stat-value-sm">
              ${currentPrice.toLocaleString()}
            </div>
            <span
              className={`fw-semibold ${isPositive ? 'text-success' : 'text-danger'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)} (
              {changePercent}%)
            </span>
          </div>
        </div>

        <div className="chart-container" style={{ height: 280 }}>
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
}

export default MarketTrendsCard
