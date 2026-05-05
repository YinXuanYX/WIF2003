import { useQuery } from '@tanstack/react-query'
import goalsMock from '../mocks/goals.mock'
import { simulateDelay } from '../utils/simulateDelay'

export const useGoals = () =>
  useQuery({
    queryKey: ['goals'],
    queryFn: () => simulateDelay(goalsMock),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
