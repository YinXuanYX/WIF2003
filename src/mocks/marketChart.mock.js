const BASE_TS = 1700000000000
const DAY = 86400000

const generatePrices = () => {
  const prices = []
  let price = 36000
  for (let i = 0; i < 30; i++) {
    price += (Math.random() - 0.48) * 800
    price = Math.max(price, 30000)
    prices.push([BASE_TS + i * DAY, Math.round(price * 100) / 100])
  }
  return prices
}

const prices = generatePrices()

const marketChartMock = {
  prices,
  market_caps: prices.map(([ts, p]) => [ts, Math.round(p * 19444444)]),
  total_volumes: prices.map(([ts]) => [
    ts,
    Math.round(15000000000 + Math.random() * 5000000000),
  ]),
}

export default marketChartMock
