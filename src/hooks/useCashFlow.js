import { useQuery } from '@tanstack/react-query'
import cashflowMock from '../mocks/cashflow.mock'
import { simulateDelay } from '../utils/simulateDelay'

export const useCashFlow = () =>
  useQuery({
    queryKey: ['cashflow'],
    queryFn: () => simulateDelay(cashflowMock),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
