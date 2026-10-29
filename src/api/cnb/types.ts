export type ExchangeRate = {
  country: string
  currency: string
  amount: number
  code: string
  rate: number
}

export type ExchangeRates = {
  date: string
  sequence: number
  rates: ExchangeRate[]
}
