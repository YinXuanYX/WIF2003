import { useQuery } from '@tanstack/react-query'
import bitcoin7d from '../mocks/coingecko.market_chart.bitcoin.7d.json'
import bitcoin30d from '../mocks/coingecko.market_chart.bitcoin.30d.json'
import { simulateDelay } from '../utils/simulateDelay'

const COIN_MOCKS = {
  bitcoin: {
    '7d': bitcoin7d,
    '30d': bitcoin30d,
  },
}

const normalizeDaysKey = (daysKey) => {
  if (!daysKey) return '30d'
  const value = String(daysKey)
  return value.endsWith('d') ? value : `${value}d`
}

const shouldSimulateError = () =>
  new URLSearchParams(window.location.search).get('simulateError') === '1'

const simulateHttpError = (status, message) =>
  new Promise((_, reject) =>
    setTimeout(() => {
      const error = new Error(message)
      error.status = status
      reject(error)
    }, 650)
  )

export const useMarketChart = (coinId = 'bitcoin', daysKey = '30d') => {
  const normalizedKey = normalizeDaysKey(daysKey)
  const chartMock = COIN_MOCKS[coinId]?.[normalizedKey] ?? bitcoin30d

  return useQuery({
    queryKey: ['market', coinId, normalizedKey],
    queryFn: () =>
      shouldSimulateError()
        ? simulateHttpError(503, 'Market data unavailable')
        : simulateDelay(chartMock),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
