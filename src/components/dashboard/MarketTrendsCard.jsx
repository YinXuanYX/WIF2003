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
  const { data, isLoading } = useMarketChart()
  const chartRef = useRef(null)

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  if (isLoading) return <SkeletonCard lines={6} />

  const prices = data.prices
  const currentPrice = prices[prices.length - 1][1]
  const prevPrice = prices[prices.length - 2][1]
  const priceChange = currentPrice - prevPrice
  const changePercent = ((priceChange / prevPrice) * 100).toFixed(2)
  const isPositive = priceChange >= 0

  const labels = prices.map(([ts]) =>
    new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  )

  const isDark =
    document.documentElement.getAttribute('data-bs-theme') === 'dark'

  const chartData = {
    labels,
    datasets: [
      {
        label: 'BTC Price (USD)',
        data: prices.map(([, p]) => p),
        borderColor: isPositive ? '#10b981' : '#ef4444',
        backgroundColor: isPositive
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(239, 68, 68, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          maxTicksLimit: 6,
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.8)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11 },
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
      className="card card-dashboard h-100 animate-fade-in-up"
      style={{ '--animation-order': animationOrder }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="stat-label mb-1">Market Trends</h6>
            <span className="fw-semibold">Bitcoin (BTC)</span>
          </div>
          <div className="text-end">
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              ${currentPrice.toLocaleString()}
            </div>
            <span className={`small fw-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)} ({changePercent}%)
            </span>
          </div>
        </div>

        <div className="chart-container" style={{ height: 200 }}>
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
}

export default MarketTrendsCard
