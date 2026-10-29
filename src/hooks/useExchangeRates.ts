import { useQuery } from '@tanstack/react-query'

import { fetchExchangeRates } from '../api/cnb/fetchExchangeRates'

const ONE_HOUR_MS = 60 * 60 * 1000

export function useExchangeRates() {
  return useQuery({
    queryKey: ['cnb', 'daily-rates'],
    queryFn: ({ signal }) => fetchExchangeRates(signal),
    staleTime: ONE_HOUR_MS,
  })
}
