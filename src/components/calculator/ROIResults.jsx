import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function ROIResults({ hasCalculated, principal, futureValue, netProfit, roiPercent, animationOrder = 1 }) {
  if (!hasCalculated) {
    return (
      <div className="glass-card h-100 animate-fade-in-up d-flex align-items-center justify-content-center" style={{ '--animation-order': animationOrder, minHeight: '380px' }}>
        <div className="text-center text-muted">
          <i className="bi bi-pie-chart d-block mb-2" style={{ fontSize: '2rem', opacity: 0.5 }} />
          <p className="mb-0">Enter your investment details<br/>and calculate to see the projection.</p>
        </div>
      </div>
    )
  }

  const isProfit = netProfit >= 0

  const chartData = [
    { name: 'Principal', value: principal },
    { name: isProfit ? 'Profit' : 'Loss', value: Math.abs(netProfit) },
  ]

  // Use PRD colors from CSS variables if possible, or hardcode similar values
  const chartColors = isProfit 
    ? ['rgba(37, 99, 235, 0.85)', 'rgba(16, 185, 129, 0.85)'] // Primary, Success
    : ['rgba(37, 99, 235, 0.85)', 'rgba(239, 68, 68, 0.85)']  // Primary, Danger

  return (
    <div className="glass-card h-100 animate-fade-in-up" style={{ '--animation-order': animationOrder }}>
      <div className="card-body d-flex flex-column">
        <h6 className="stat-label mb-3">
          <i className="bi bi-graph-up me-1" />
          Projection Results
        </h6>

        <div className="row g-3 mb-4">
          <div className="col-sm-6">
            <div className="summary-stat-card summary-stat-card--disposable rounded-3 p-3">
              <div className="text-muted small mb-1">Future Value</div>
              <div className="stat-value-sm text-primary">
                RM {futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className={`summary-stat-card rounded-3 p-3 ${isProfit ? 'summary-stat-card--income' : 'summary-stat-card--expense'}`}>
              <div className="text-muted small mb-1">Net {isProfit ? 'Profit' : 'Loss'}</div>
              <div className={`stat-value-sm ${isProfit ? 'text-success' : 'text-danger'}`}>
                {isProfit ? '+' : '-'} RM {Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className={`summary-stat-card rounded-3 p-3 text-center ${isProfit ? 'summary-stat-card--income' : 'summary-stat-card--expense'}`}>
              <div className="text-muted small mb-1">Total ROI</div>
              <div className={`stat-value ${isProfit ? 'text-success' : 'text-danger'}`}>
                {isProfit ? '+' : ''}{roiPercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow-1" style={{ minHeight: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `RM ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default ROIResults
