import useAuthStore from '../stores/authStore'
import CashFlowCard from '../components/dashboard/CashFlowCard'
import GoalProgressCard from '../components/dashboard/GoalProgressCard'
import RiskProfileCard from '../components/dashboard/RiskProfileCard'
import MarketTrendsCard from '../components/dashboard/MarketTrendsCard'

function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <div className="dashboard-greeting mb-4 animate-fade-in-up">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your financial snapshot for today.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <CashFlowCard animationOrder={0} />
        </div>
        <div className="col-lg-5">
          <GoalProgressCard animationOrder={1} />
        </div>
        <div className="col-12">
          <MarketTrendsCard animationOrder={2} />
        </div>
        <div className="col-lg-4">
          <RiskProfileCard animationOrder={3} />
        </div>
        <div className="col-lg-8">
          <div
            className="glass-card h-100 animate-fade-in-up"
            style={{ '--animation-order': 4 }}
          >
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
              <span className="fs-1 mb-3">🚀</span>
              <h5 className="fw-semibold mb-1">Quick Actions</h5>
              <p className="text-muted small mb-0">
                Feature pages coming soon — Goals, Strategy, Market Insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
