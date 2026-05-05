import { useQuery } from '@tanstack/react-query'
import riskProfileMock from '../mocks/riskProfile.mock'
import { simulateDelay } from '../utils/simulateDelay'

export const useRiskProfile = () =>
  useQuery({
    queryKey: ['riskProfile'],
    queryFn: () => simulateDelay(riskProfileMock),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
