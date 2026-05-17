import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import GlassCard from "../ui/GlassCard";

// show total investment value and total profit at a specific year
const CustomTooltip = ({ active, payload, label, principal }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="glass-card p-3 shadow-sm"
        style={{
          background: "var(--glass-bg)",
          border: "var(--glass-border)",
          borderRadius: "0.75rem",
          backdropFilter: "blur(20px)",
        }}
      >
        <p className="fw-semibold mb-2">{label}</p>
        <div className="d-flex justify-content-between gap-4 mb-1">
          <span className="text-muted small">Total Value:</span>
          <span className="fw-bold">
            RM{" "}
            {payload[0].value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="d-flex justify-content-between gap-4">
          <span className="text-muted small">Profit:</span>
          <span className="fw-bold text-success">
            RM{" "}
            {(payload[0].value - principal).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function ROIResults({
  hasCalculated,
  inputs,
  principal,
  futureValue,
  netProfit,
  roiPercent,
  animationOrder = 1,
}) {
  // before calculate show placeholder
  if (!hasCalculated || !inputs) {
    return (
      <GlassCard
        className="h-100"
        bodyClassName="d-flex align-items-center justify-content-center"
        animationOrder={animationOrder}
        style={{ minHeight: "380px" }}
      >
        <div className="text-center text-muted">
          <i
            className="bi bi-graph-up d-block mb-3"
            style={{ fontSize: "2.5rem", opacity: 0.5 }}
          />
          <p className="mb-0">
            Enter your investment details
            <br />
            to see the projection.
          </p>
        </div>
      </GlassCard>
    );
  }

  const isProfit = netProfit >= 0;

  // generate year-over-year projection data 
  const generateProjectionData = () => {
    const data = [];
    const { principal, rate, years, compounding } = inputs;
    const r = rate / 100;
    const n = compounding;

    for (let i = 0; i <= years; i++) {
      const amount = principal * Math.pow(1 + r / n, n * i);
      data.push({
        year: `Year ${i}`,
        value: amount,
        principal: principal,
        profit: amount - principal,
      });
    }
    return data;
  };

  const chartData = generateProjectionData();

  return (
    <GlassCard className="h-100" animationOrder={animationOrder}>
      <h6 className="stat-label mb-3">
        <i className="bi bi-graph-up me-1" />
        Projection Results
      </h6>

      <div className="row g-3 mb-4">
        {/* show future value */}
        <div className="col-sm-6">
          <div
            className="p-3 rounded-4"
            style={{ background: "rgba(37, 99, 235, 0.1)" }}
          >
            <div className="text-muted small mb-1">Future Value</div>
            <div className="stat-value-sm text-primary">
              RM{" "}
              {futureValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* show net profit */}
        <div className="col-sm-6">
          <div
            className={`p-3 rounded-4 ${isProfit ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}
          >
            <div className="text-muted small mb-1">
              Net {isProfit ? "Profit" : "Loss"}
            </div>
            <div
              className={`stat-value-sm ${isProfit ? "text-success" : "text-danger"}`}
            >
              {isProfit ? "+" : "-"} RM{" "}
              {Math.abs(netProfit).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* show total ROI */}
        <div className="col-12">
          <div
            className={`p-3 rounded-4 text-center ${isProfit ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}
          >
            <div className="text-muted small mb-1">Total ROI</div>
            <div
              className={`stat-value ${isProfit ? "text-success" : "text-danger"}`}
            >
              {isProfit ? "+" : ""}
              {roiPercent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              %
            </div>
          </div>
        </div>
      </div>

      {/* show projection chart */}
      <div className="flex-grow-1 mt-4" style={{ minHeight: "260px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(150,150,150,0.15)"
            />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              minTickGap={30}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(val) => `RM ${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip principal={principal} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export default ROIResults;