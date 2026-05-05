import { useQuery } from '@tanstack/react-query'
import aaplQuote from '../mocks/finnhub.quote.AAPL.json'
import tslaQuote from '../mocks/finnhub.quote.TSLA.json'
import { simulateDelay } from '../utils/simulateDelay'

const QUOTE_MOCKS = {
  AAPL: aaplQuote,
  TSLA: tslaQuote,
}

const normalizeSymbol = (symbol) => (symbol ? symbol.toUpperCase() : 'AAPL')

const shouldSimulate429 = () =>
  new URLSearchParams(window.location.search).get('simulate429') === '1'

const simulateHttpError = (status, message) =>
  new Promise((_, reject) =>
    setTimeout(() => {
      const error = new Error(message)
      error.status = status
      reject(error)
    }, 650)
  )

export const useEquityQuote = (symbol = 'AAPL') => {
  const normalizedSymbol = normalizeSymbol(symbol)
  const quoteMock = QUOTE_MOCKS[normalizedSymbol] ?? aaplQuote

  return useQuery({
    queryKey: ['market', 'equityQuote', normalizedSymbol],
    queryFn: () =>
      shouldSimulate429()
        ? simulateHttpError(429, 'Rate limit exceeded')
        : simulateDelay(quoteMock),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) =>
      error?.status === 429 && failureCount < 1,
    retryDelay: (failureCount, error) =>
      error?.status === 429 ? 60 * 1000 : 0,
  })
}
