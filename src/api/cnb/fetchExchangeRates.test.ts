import { http, HttpResponse } from 'msw/http'
import { afterEach, describe, expect, it, vi } from 'vitest'

import dailyTxt from '../../test/fixtures/daily.txt?raw'
import { server } from '../../test/server'
import { CNB_DAILY_RATES_PATH } from './constants'
import { fetchExchangeRates } from './fetchExchangeRates'
import { ExchangeRatesParseError, parseExchangeRates } from './parseExchangeRates'

const RATES_URL = `*${CNB_DAILY_RATES_PATH}`

describe('fetchExchangeRates', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns parsed exchange rates', async () => {
    const rates = await fetchExchangeRates()

    expect(rates).toEqual(parseExchangeRates(dailyTxt))
  })

  it('rejects when the response status is not ok', async () => {
    server.use(http.get(RATES_URL, () => new HttpResponse(null, { status: 500 })))

    await expect(fetchExchangeRates()).rejects.toThrow('500')
  })

  it('rejects when the response body is malformed', async () => {
    server.use(http.get(RATES_URL, () => HttpResponse.text('not exchange rates')))

    await expect(fetchExchangeRates()).rejects.toBeInstanceOf(ExchangeRatesParseError)
  })

  it('sends the request without using the HTTP cache', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await fetchExchangeRates()

    expect(fetchSpy).toHaveBeenCalledWith(
      CNB_DAILY_RATES_PATH,
      expect.objectContaining({ cache: 'no-cache' }),
    )
  })

  it('rejects when the request is aborted', async () => {
    const controller = new AbortController()

    controller.abort()

    await expect(fetchExchangeRates(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
