import { useState } from 'react'
import CryptoChart from '../components/market/CryptoChart'
import EquityQuoteCard from '../components/market/EquityQuoteCard'
import MarketNewsCard from '../components/market/MarketNewsCard'
import CurrencySelector from '../components/market/CurrencySelector'
import CurrencyConverterCard from '../components/market/CurrencyConverterCard'
import { useForexRates } from '../hooks/useForexRates'

function MarketInsightsPage() {
  const [currency, setCurrency] = useState('usd')
  const { data: forexData } = useForexRates()
  const rates = forexData?.tether ?? null

  return (
    <div className="market-insights-page">
      <div className="dashboard-greeting mb-4 animate-fade-in-up">
        <h1>Market Insights</h1>
        <p>Track crypto momentum, key equity quotes, and the latest market news.</p>
        <div className="mt-3">
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <CryptoChart coinId="bitcoin" currency={currency} />
        </div>

        <div className="col-12">
          <div className="row g-4">
            <div className="col-lg-6">
              <EquityQuoteCard
                symbol="AAPL"
                name="Apple Inc."
                animationOrder={2}
                currency={currency}
                rate={rates?.[currency] ?? null}
              />
            </div>
            <div className="col-lg-6">
              <EquityQuoteCard
                symbol="TSLA"
                name="Tesla, Inc."
                animationOrder={3}
                currency={currency}
                rate={rates?.[currency] ?? null}
              />
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="row g-4">
            <div className="col-lg-8">
              <MarketNewsCard category="general" animationOrder={4} />
            </div>
            <div className="col-lg-4">
              <CurrencyConverterCard rates={rates} animationOrder={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketInsightsPage
