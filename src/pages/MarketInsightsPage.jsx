import CryptoChart from '../components/market/CryptoChart'
import EquityQuoteCard from '../components/market/EquityQuoteCard'
import MarketNewsCard from '../components/market/MarketNewsCard'

function MarketInsightsPage() {
  return (
    <div className="market-insights-page">
      <div className="dashboard-greeting mb-4 animate-fade-in-up">
        <h1>Market Insights</h1>
        <p>Track crypto momentum, key equity quotes, and the latest market news.</p>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <CryptoChart coinId="bitcoin" />
        </div>

        <div className="col-12">
          <div className="row g-4">
            <div className="col-lg-6">
              <EquityQuoteCard
                symbol="AAPL"
                name="Apple Inc."
                animationOrder={2}
              />
            </div>
            <div className="col-lg-6">
              <EquityQuoteCard
                symbol="TSLA"
                name="Tesla, Inc."
                animationOrder={3}
              />
            </div>
          </div>
        </div>

        <div className="col-12">
          <MarketNewsCard category="general" animationOrder={4} />
        </div>
      </div>
    </div>
  )
}

export default MarketInsightsPage
