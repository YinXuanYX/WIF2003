import { useQuery } from '@tanstack/react-query'
import marketChartMock from '../mocks/marketChart.mock'
import { simulateDelay } from '../utils/simulateDelay'

export const useMarketChart = (coinId = 'bitcoin', days = '30') =>
  useQuery({
    queryKey: ['market', coinId, days],
    queryFn: () => simulateDelay(marketChartMock),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
