import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../utils/api'

export const useForexRates = () => {
  return useQuery({
    queryKey: ['market', 'forexRates'],
    queryFn: () => marketApi.getForexRates(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
