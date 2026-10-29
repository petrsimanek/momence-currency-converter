import { z } from 'zod'

type EmptyAmount = { status: 'empty' }
type InvalidAmount = { status: 'invalid'; message: string }
type ValidAmount = { status: 'valid'; value: number }

export type AmountParseResult = EmptyAmount | InvalidAmount | ValidAmount

export const MAX_AMOUNT = 1_000_000_000_000

const WHITESPACE_PATTERN = /\s/g
const AMOUNT_PATTERN = /^(\d+(\.\d*)?|\.\d+)$/

const amountSchema = z
  .string()
  .refine((value) => !value.includes(','), {
    error: 'Use a dot as the decimal separator',
    abort: true,
  })
  .regex(AMOUNT_PATTERN, { error: 'Enter a valid non-negative number', abort: true })
  .transform(Number)
  .refine((value) => value <= MAX_AMOUNT, 'Amount is too large')

export function parseAmount(input: string): AmountParseResult {
  const cleaned = input.replace(WHITESPACE_PATTERN, '')

  if (cleaned === '') {
    return { status: 'empty' }
  }

  const result = amountSchema.safeParse(cleaned)

  if (!result.success) {
    return { status: 'invalid', message: result.error.issues[0].message }
  }

  return { status: 'valid', value: result.data }
}

export const amountFieldSchema = z.string().superRefine((value, context) => {
  const parsed = parseAmount(value)

  if (parsed.status === 'invalid') {
    context.addIssue(parsed.message)
  }
})
