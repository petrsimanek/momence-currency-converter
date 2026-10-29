import { z } from 'zod'

const TITLE_PATTERN = /^(\d{1,2} [A-Za-z]{3} \d{4}) #(\d+)$/
const AMOUNT_PATTERN = /^\d+$/
const RATE_PATTERN = /^\d+(\.\d+)?$/
const CODE_PATTERN = /^[A-Z]{3}$/

function positiveNumber(pattern: RegExp, fieldName: string) {
  const message = `${fieldName} must be a positive number`

  return z
    .string()
    .regex(pattern, message)
    .transform(Number)
    .refine((value) => Number.isFinite(value) && value > 0, message)
}

export const titleSchema = z.string().transform((line, ctx) => {
  const match = TITLE_PATTERN.exec(line)

  if (!match) {
    ctx.addIssue('invalid date and sequence')

    return z.NEVER
  }

  const [, date, sequence] = match

  return { date, sequence: Number(sequence) }
})

export const exchangeRateSchema = z.object({
  country: z.string().min(1, 'empty country or currency'),
  currency: z.string().min(1, 'empty country or currency'),
  code: z.string().regex(CODE_PATTERN, 'invalid currency code'),
  amount: positiveNumber(AMOUNT_PATTERN, 'amount'),
  rate: positiveNumber(RATE_PATTERN, 'rate'),
})
