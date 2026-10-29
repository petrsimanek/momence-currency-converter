type EmptyAmount = { status: 'empty' }
type InvalidAmount = { status: 'invalid'; message: string }
type ValidAmount = { status: 'valid'; value: number }

export type AmountParseResult = EmptyAmount | InvalidAmount | ValidAmount

export const MAX_AMOUNT = 1_000_000_000_000

const WHITESPACE_PATTERN = /\s/g
const AMOUNT_PATTERN = /^\d+(\.\d*)?$/

export function parseAmount(input: string): AmountParseResult {
  const cleaned = input.replace(WHITESPACE_PATTERN, '')

  if (cleaned === '') {
    return { status: 'empty' }
  }

  if (cleaned.includes(',')) {
    return { status: 'invalid', message: 'Use a dot as the decimal separator' }
  }

  if (!AMOUNT_PATTERN.test(cleaned)) {
    return { status: 'invalid', message: 'Enter a valid non-negative number' }
  }

  const value = Number(cleaned)

  if (value > MAX_AMOUNT) {
    return { status: 'invalid', message: 'Amount is too large' }
  }

  return { status: 'valid', value }
}
