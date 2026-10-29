import type { ExchangeRate, ExchangeRates } from './types'

const TITLE_PATTERN = /^(\d{1,2} [A-Za-z]{3} \d{4}) #(\d+)$/
const COLUMNS_LINE = 'Country|Currency|Amount|Code|Rate'
const COLUMN_COUNT = 5
const AMOUNT_PATTERN = /^\d+$/
const RATE_PATTERN = /^\d+(\.\d+)?$/
const CODE_PATTERN = /^[A-Z]{3}$/

export class ExchangeRatesParseError extends Error {
  constructor(lineNumber: number, reason: string) {
    super(`Invalid CNB exchange rates at line ${lineNumber}: ${reason}`)
    this.name = 'ExchangeRatesParseError'
  }
}

function parseTitle(line: string, lineNumber: number) {
  const match = TITLE_PATTERN.exec(line)

  if (!match) {
    throw new ExchangeRatesParseError(lineNumber, 'invalid date and sequence')
  }

  return { date: match[1], sequence: Number(match[2]) }
}

function assertColumns(line: string, lineNumber: number) {
  if (line !== COLUMNS_LINE) {
    throw new ExchangeRatesParseError(lineNumber, 'unexpected column names')
  }
}

function parsePositiveNumber(
  value: string,
  pattern: RegExp,
  fieldName: string,
  lineNumber: number,
) {
  const parsed = Number(value)

  if (!pattern.test(value) || !Number.isFinite(parsed) || parsed <= 0) {
    throw new ExchangeRatesParseError(lineNumber, `${fieldName} must be a positive number`)
  }

  return parsed
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

  if (country === '' || currency === '') {
    throw new ExchangeRatesParseError(lineNumber, 'empty country or currency')
  }

  if (!CODE_PATTERN.test(code)) {
    throw new ExchangeRatesParseError(lineNumber, 'invalid currency code')
  }

  return {
    country,
    currency,
    amount: parsePositiveNumber(amount, AMOUNT_PATTERN, 'amount', lineNumber),
    code,
    rate: parsePositiveNumber(rate, RATE_PATTERN, 'rate', lineNumber),
  }
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
