import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../utils/api'

export const useMarketNews = (category = 'general') => {
  return useQuery({
    queryKey: ['market', 'news', category],
    queryFn: () => marketApi.getMarketNews(category),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) =>
      error?.status === 429 && failureCount < 1,
    retryDelay: (failureCount, error) =>
      error?.status === 429 ? 60 * 1000 : 0,
  })
}
