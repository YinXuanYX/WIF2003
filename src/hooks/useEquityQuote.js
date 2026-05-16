import { useQuery } from '@tanstack/react-query'
import { marketApi } from '../utils/api'

const normalizeSymbol = (symbol) => (symbol ? symbol.toUpperCase() : 'AAPL')

export const useEquityQuote = (symbol = 'AAPL') => {
  const normalizedSymbol = normalizeSymbol(symbol)

  return useQuery({
    queryKey: ['market', 'equityQuote', normalizedSymbol],
    queryFn: () => marketApi.getEquityQuote(normalizedSymbol),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) =>
      error?.status === 429 && failureCount < 1,
    retryDelay: (failureCount, error) =>
      error?.status === 429 ? 60 * 1000 : 0,
  })
}
