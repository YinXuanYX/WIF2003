import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../utils/api'

const normalizeDaysKey = (daysKey) => {
  if (!daysKey) return '30d'
  const value = String(daysKey)
  return value.endsWith('d') ? value : `${value}d`
}

export const useMarketChart = (coinId = 'bitcoin', daysKey = '30d', currency = 'usd') => {
  const normalizedKey = normalizeDaysKey(daysKey)

  return useQuery({
    queryKey: ['market', coinId, normalizedKey, currency],
    queryFn: () => marketApi.getCryptoChart(coinId, normalizedKey.replace('d', ''), currency),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
