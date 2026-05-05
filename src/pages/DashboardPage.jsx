import useAuthStore from '../stores/useAuthStore'
import CashFlowCard from '../components/dashboard/CashFlowCard'
import GoalProgressCard from '../components/dashboard/GoalProgressCard'
import RiskProfileCard from '../components/dashboard/RiskProfileCard'
import MarketTrendsCard from '../components/dashboard/MarketTrendsCard'

function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="container-fluid px-4 py-4">
      <div className="dashboard-greeting mb-4 animate-fade-in-up">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your financial snapshot for today.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <CashFlowCard animationOrder={0} />
        </div>
        <div className="col-lg-6">
          <GoalProgressCard animationOrder={1} />
        </div>
        <div className="col-lg-6">
          <RiskProfileCard animationOrder={2} />
        </div>
        <div className="col-lg-6">
          <MarketTrendsCard animationOrder={3} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
