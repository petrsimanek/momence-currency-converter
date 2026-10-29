import type { z } from 'zod'

import { exchangeRateSchema, titleSchema } from './schemas'
import type { ExchangeRate, ExchangeRates } from './types'

const COLUMNS_LINE = 'Country|Currency|Amount|Code|Rate'
const COLUMN_COUNT = 5

export class ExchangeRatesParseError extends Error {
  constructor(lineNumber: number, reason: string) {
    super(`Invalid CNB exchange rates at line ${lineNumber}: ${reason}`)
    this.name = 'ExchangeRatesParseError'
  }
}

function toParseError(error: z.ZodError, lineNumber: number) {
  return new ExchangeRatesParseError(lineNumber, error.issues[0].message)
}

function parseTitle(line: string, lineNumber: number) {
  const result = titleSchema.safeParse(line)

  if (!result.success) {
    throw toParseError(result.error, lineNumber)
  }

  return result.data
}

function assertColumns(line: string, lineNumber: number) {
  if (line !== COLUMNS_LINE) {
    throw new ExchangeRatesParseError(lineNumber, 'unexpected column names')
  }
}

function parseRow(line: string, lineNumber: number): ExchangeRate {
  const fields = line.split('|')

  if (fields.length !== COLUMN_COUNT) {
    throw new ExchangeRatesParseError(
      lineNumber,
      `expected ${COLUMN_COUNT} fields, got ${fields.length}`,
    )
  }

  const [country, currency, amount, code, rate] = fields
  const result = exchangeRateSchema.safeParse({ country, currency, amount, code, rate })

  if (!result.success) {
    throw toParseError(result.error, lineNumber)
  }

  return result.data
}

export function parseExchangeRates(text: string): ExchangeRates {
  const lines = text
    .split(/\r?\n/)
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => line.trim() !== '')

  if (lines.length === 0) {
    throw new ExchangeRatesParseError(1, 'empty input')
  }

  const [titleLine, columnsLine, ...rowLines] = lines
  const { date, sequence } = parseTitle(titleLine.line, titleLine.lineNumber)

  if (!columnsLine) {
    throw new ExchangeRatesParseError(titleLine.lineNumber + 1, 'missing column names')
  }

  assertColumns(columnsLine.line, columnsLine.lineNumber)

  const rates = rowLines.map(({ line, lineNumber }) => parseRow(line, lineNumber))

  return { date, sequence, rates }
}
