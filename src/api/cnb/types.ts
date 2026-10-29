import type { z } from 'zod'

import type { exchangeRateSchema } from './schemas'

export type ExchangeRate = z.infer<typeof exchangeRateSchema>

export type ExchangeRates = {
  date: string
  sequence: number
  rates: ExchangeRate[]
}
