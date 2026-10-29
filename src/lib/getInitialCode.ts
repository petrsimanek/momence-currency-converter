import type { ExchangeRate } from '../api/cnb/types'

const DEFAULT_CODE = 'EUR'

export function getInitialCode(rates: ExchangeRate[]): string {
  const hasDefault = rates.some((rate) => rate.code === DEFAULT_CODE)

  return hasDefault ? DEFAULT_CODE : rates[0].code
}
