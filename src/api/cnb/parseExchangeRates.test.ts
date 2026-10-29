import { beforeAll, describe, expect, it } from 'vitest'

import dailyTxt from '../../test/fixtures/daily.txt?raw'
import { ExchangeRatesParseError, parseExchangeRates } from './parseExchangeRates'

const HEADER_LINE = '29 Oct 2026 #208'
const COLUMNS_LINE = 'Country|Currency|Amount|Code|Rate'

function buildText(...lines: string[]): string {
  return lines.join('\n')
}

function expectParseError(text: string, lineNumber: number) {
  expect(() => parseExchangeRates(text)).toThrow(ExchangeRatesParseError)
  expect(() => parseExchangeRates(text)).toThrow(new RegExp(`at line ${lineNumber}:`))
}

describe('parseExchangeRates', () => {
  describe('real CNB fixture', () => {
    let result: ReturnType<typeof parseExchangeRates>

    beforeAll(() => {
      result = parseExchangeRates(dailyTxt)
    })

    it('parses date and sequence number', () => {
      expect(result.date).toBe('29 Oct 2026')
      expect(result.sequence).toBe(208)
    })

    it('parses all data rows', () => {
      expect(result.rates).toHaveLength(30)
    })

    it('keeps amount 1 for EUR', () => {
      expect(result.rates.find((rate) => rate.code === 'EUR')).toEqual({
        country: 'EMU',
        currency: 'euro',
        amount: 1,
        code: 'EUR',
        rate: 24.335,
      })
    })

    it('does not normalize amount 100 for HUF', () => {
      expect(result.rates.find((rate) => rate.code === 'HUF')).toMatchObject({
        amount: 100,
        rate: 6.65,
      })
    })
  })

  describe('valid input variants', () => {
    const body = 'EMU|euro|1|EUR|24.335'

    it('handles CRLF line endings', () => {
      const result = parseExchangeRates([HEADER_LINE, COLUMNS_LINE, body].join('\r\n'))

      expect(result.rates).toHaveLength(1)
      expect(result.rates[0].rate).toBe(24.335)
    })

    it('ignores trailing newlines', () => {
      const result = parseExchangeRates(buildText(HEADER_LINE, COLUMNS_LINE, body, '', ''))

      expect(result.rates).toHaveLength(1)
    })

    it('parses a single-digit day', () => {
      const result = parseExchangeRates(buildText('1 Oct 2026 #1', COLUMNS_LINE, body))

      expect(result.date).toBe('1 Oct 2026')
      expect(result.sequence).toBe(1)
    })

    it('parses an integer rate', () => {
      const result = parseExchangeRates(buildText(HEADER_LINE, COLUMNS_LINE, 'EMU|euro|1|EUR|24'))

      expect(result.rates[0].rate).toBe(24)
    })

    it('skips blank lines between rows', () => {
      const result = parseExchangeRates(buildText(HEADER_LINE, COLUMNS_LINE, '', body, '', body))

      expect(result.rates).toHaveLength(2)
    })

    it('treats whitespace-only lines as blank', () => {
      const result = parseExchangeRates(buildText(HEADER_LINE, COLUMNS_LINE, body, ' ', '\t'))

      expect(result.rates).toHaveLength(1)
    })

    it('returns no rates for a header only', () => {
      expect(parseExchangeRates(buildText(HEADER_LINE, COLUMNS_LINE))).toEqual({
        date: '29 Oct 2026',
        sequence: 208,
        rates: [],
      })
    })
  })

  describe('invalid input', () => {
    it('rejects an empty string', () => {
      expect(() => parseExchangeRates('')).toThrow(ExchangeRatesParseError)
    })

    it('sets the error name', () => {
      expect(() => parseExchangeRates('')).toThrow(
        expect.objectContaining({ name: 'ExchangeRatesParseError' }),
      )
    })

    it.each([
      ['wrong date line', '2026-10-29 #208'],
      ['missing sequence', '29 Oct 2026'],
      ['non-numeric sequence', '29 Oct 2026 #abc'],
    ])('rejects first line: %s', (_name, firstLine) => {
      expectParseError(buildText(firstLine, COLUMNS_LINE), 1)
    })

    it.each([
      ['wrong column names', 'Country|Currency|Amount|Code|Price'],
      ['swapped columns', 'Currency|Country|Amount|Code|Rate'],
      ['missing column', 'Country|Currency|Amount|Code'],
    ])('rejects column line: %s', (_name, columnsLine) => {
      expectParseError(buildText(HEADER_LINE, columnsLine), 2)
    })

    it('rejects a missing column line', () => {
      expectParseError(HEADER_LINE, 2)
    })

    it.each([
      ['4 fields', 'EMU|euro|1|EUR'],
      ['6 fields', 'EMU|euro|1|EUR|24.335|x'],
      ['non-numeric rate', 'EMU|euro|1|EUR|abc'],
      ['scientific rate', 'EMU|euro|1|EUR|1e3'],
      ['hex rate', 'EMU|euro|1|EUR|0x10'],
      ['negative rate', 'EMU|euro|1|EUR|-1'],
      ['zero rate', 'EMU|euro|1|EUR|0'],
      ['zero amount', 'EMU|euro|0|EUR|24.335'],
      ['decimal amount', 'EMU|euro|1.5|EUR|24.335'],
      ['lowercase code', 'EMU|euro|1|eu|24.335'],
      ['empty country', '|euro|1|EUR|24.335'],
      ['empty currency', 'EMU||1|EUR|24.335'],
      ['infinite rate', `EMU|euro|1|EUR|${'9'.repeat(400)}`],
    ])('rejects data row: %s', (_name, row) => {
      expectParseError(buildText(HEADER_LINE, COLUMNS_LINE, row), 3)
    })

    it('reports real line numbers when blank lines precede the failing row', () => {
      expectParseError(
        buildText(HEADER_LINE, '', COLUMNS_LINE, '', 'EMU|euro|1|EUR|24.335', '', 'Broken|row'),
        7,
      )
    })

    it('reports the real line number of a column error after a blank line', () => {
      expectParseError(buildText('', HEADER_LINE, '', 'Wrong|columns'), 4)
    })

    it('reports the line number of the failing row', () => {
      expectParseError(
        buildText(
          HEADER_LINE,
          COLUMNS_LINE,
          'EMU|euro|1|EUR|24.335',
          'Hungary|forint|100|HUF|6.650',
          'Broken|row',
        ),
        5,
      )
    })
  })
})
