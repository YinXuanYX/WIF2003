import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../utils/api'

const normalizeDaysKey = (daysKey) => {
  if (!daysKey) return '30d'
  const value = String(daysKey)
  return value.endsWith('d') ? value : `${value}d`
}

export const useMarketChart = (coinId = 'bitcoin', daysKey = '30d') => {
  const normalizedKey = normalizeDaysKey(daysKey)

  return useQuery({
    queryKey: ['market', coinId, normalizedKey],
    queryFn: () => marketApi.getCryptoChart(coinId, normalizedKey.replace('d', '')),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
