import { describe, expect, it } from 'vitest'

import { MAX_AMOUNT, parseAmount } from './parseAmount'

describe('parseAmount', () => {
  it.each(['', '   ', ' '])('treats %j as empty', (input) => {
    expect(parseAmount(input)).toEqual({ status: 'empty' })
  })

  it.each([
    ['100', 100],
    ['1.5', 1.5],
    ['12.', 12],
    ['1 000', 1000],
    ['1\u00A0000', 1000],
    ['1\u202F000', 1000],
    ['0', 0],
  ])('parses %j as %d', (input, value) => {
    expect(parseAmount(input)).toEqual({ status: 'valid', value })
  })

  it.each(['1,000', '1,5'])('rejects a comma in %j', (input) => {
    expect(parseAmount(input)).toEqual({
      status: 'invalid',
      message: 'Use a dot as the decimal separator',
    })
  })

  it.each(['-5', 'abc', '1.2.3', '1e5', '.5'])('rejects %j', (input) => {
    expect(parseAmount(input)).toEqual({
      status: 'invalid',
      message: 'Enter a valid non-negative number',
    })
  })

  it('accepts the maximum amount', () => {
    expect(parseAmount(String(MAX_AMOUNT))).toEqual({
      status: 'valid',
      value: MAX_AMOUNT,
    })
  })

  it('rejects amounts above the maximum', () => {
    expect(parseAmount('1000000000001')).toEqual({
      status: 'invalid',
      message: 'Amount is too large',
    })
  })
})
