import { describe, expect, it } from 'vitest'

import type { ExchangeRate } from '../api/cnb/types'
import { getInitialCode } from './getInitialCode'

const rate = (code: string): ExchangeRate => ({
  country: code,
  currency: code,
  amount: 1,
  code,
  rate: 1,
})

describe('getInitialCode', () => {
  it('prefers EUR', () => {
    expect(getInitialCode([rate('HUF'), rate('EUR')])).toBe('EUR')
  })

  it('falls back to the first currency when EUR is missing', () => {
    expect(getInitialCode([rate('HUF'), rate('USD')])).toBe('HUF')
  })
})
