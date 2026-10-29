import { CNB_DAILY_RATES_PATH } from './constants'
import { parseExchangeRates } from './parseExchangeRates'
import type { ExchangeRates } from './types'

export async function fetchExchangeRates(signal?: AbortSignal): Promise<ExchangeRates> {
  // CNB sends Cache-Control: max-age=86400, so revalidate to avoid yesterday's rates
  const response = await fetch(CNB_DAILY_RATES_PATH, { signal, cache: 'no-cache' })

  if (!response.ok) {
    throw new Error(`CNB request failed with status ${response.status}`)
  }

  return parseExchangeRates(await response.text())
}
