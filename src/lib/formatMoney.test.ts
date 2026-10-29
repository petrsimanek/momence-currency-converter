import { describe, expect, it } from 'vitest'

import { formatMoney } from './formatMoney'

const format = (value: number, currencyCode: string) =>
  formatMoney(value, currencyCode).replace(/\s/g, ' ')

describe('formatMoney', () => {
  it('shows two decimal places for EUR', () => {
    expect(format(1234.5, 'EUR')).toBe('EUR 1,234.50')
  })

  it('shows no decimal places for JPY', () => {
    expect(format(1234.5, 'JPY')).toBe('JPY 1,235')
  })

  it('separates thousands in large numbers', () => {
    expect(format(1234567890.12, 'USD')).toBe('USD 1,234,567,890.12')
  })

  it('shows the currency code instead of a symbol', () => {
    expect(format(10, 'AUD')).toBe('AUD 10.00')
  })

  it('uses the minor units of currencies without a symbol', () => {
    expect(format(1, 'XDR')).toBe('XDR 1.00')
    expect(format(1, 'IDR')).toBe('IDR 1')
  })
})
