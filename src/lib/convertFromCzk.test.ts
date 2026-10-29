import { describe, expect, it } from 'vitest'

import { convertFromCzk } from './convertFromCzk'

describe('convertFromCzk', () => {
  it('converts using a rate for one unit', () => {
    expect(convertFromCzk(100, { amount: 1, rate: 25 })).toBe(4)
  })

  it('converts using a rate quoted for 100 units', () => {
    expect(convertFromCzk(100, { amount: 100, rate: 15 })).toBeCloseTo(666.667, 3)
  })

  it('converts using a rate quoted for 1000 units', () => {
    expect(convertFromCzk(100, { amount: 1000, rate: 150 })).toBeCloseTo(666.667, 3)
  })

  it('returns zero for zero CZK', () => {
    expect(convertFromCzk(0, { amount: 1, rate: 25 })).toBe(0)
  })
})
