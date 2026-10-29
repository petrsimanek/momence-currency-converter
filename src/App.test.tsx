import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw/http'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CNB_DAILY_RATES_PATH } from './api/cnb/constants'
import App from './App'
import dailyTxt from './test/fixtures/daily.txt?raw'
import { renderWithProviders } from './test/renderWithProviders'
import { server } from './test/server'

const RATES_URL = `*${CNB_DAILY_RATES_PATH}`
const ERROR_MESSAGE = 'Could not load exchange rates.'
const HEADER_ONLY_TXT = dailyTxt.split('\n').slice(0, 2).join('\n')

const getResult = () =>
  within(screen.getByRole('form', { name: 'Currency converter' })).getByRole('status')

const normalizeWhitespace = (text: string | null) => (text ?? '').replace(/\s+/g, ' ').trim()

describe('App', () => {
  const silenceConsoleError = () => vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a loading state and then the exchange rates', async () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading exchange rates…')

    expect(await screen.findByText(/Rates valid for 29 Oct 2026/)).toHaveTextContent('#208')
    expect(screen.queryByText('Loading exchange rates…')).not.toBeInTheDocument()

    const table = screen.getByRole('table', { name: 'Exchange rates' })

    expect(within(table).getAllByRole('row').length).toBeGreaterThan(2)
    expect(within(table).getByRole('cell', { name: 'EUR' })).toBeInTheDocument()
  })

  it('converts the entered CZK amount into the selected currency', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />)

    await user.type(await screen.findByLabelText('Amount in CZK'), '1000')

    expect(normalizeWhitespace(getResult().textContent)).toBe('CZK 1,000.00 = EUR 41.09')
  })

  it('shows an error when the server responds with an error status and recovers on retry', async () => {
    const consoleError = silenceConsoleError()

    const user = userEvent.setup()

    server.use(http.get(RATES_URL, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGE)
    expect(screen.queryByText(/500/)).not.toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error))

    server.use(http.get(RATES_URL, () => HttpResponse.text(dailyTxt)))

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText(/Rates valid for 29 Oct 2026/)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error when the response body is malformed', async () => {
    const consoleError = silenceConsoleError()

    server.use(http.get(RATES_URL, () => HttpResponse.text('not exchange rates')))

    renderWithProviders(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGE)
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('shows an error when the network request fails', async () => {
    const consoleError = silenceConsoleError()

    server.use(http.get(RATES_URL, () => HttpResponse.error()))

    renderWithProviders(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGE)
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('shows an empty state without the converter when there are no rates', async () => {
    server.use(http.get(RATES_URL, () => HttpResponse.text(HEADER_ONLY_TXT)))

    renderWithProviders(<App />)

    expect(await screen.findByText('No exchange rates available.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Amount in CZK')).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  describe('selecting a currency from the table', () => {
    const getButton = (code: string) =>
      within(screen.getByRole('table', { name: 'Exchange rates' })).getByRole('button', {
        name: new RegExp(`^Use ${code} `),
      })

    const getSelect = () => screen.getByLabelText('Currency')

    it('sets the converter currency, converts by its rate and scrolls to the converter', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await user.type(await screen.findByLabelText('Amount in CZK'), '1000')
      await user.click(getButton('HUF'))

      expect(getSelect()).toHaveValue('HUF')
      expect(screen.getByLabelText('Amount in CZK')).toHaveValue('1000')
      expect(normalizeWhitespace(getResult().textContent)).toBe('CZK 1,000.00 = HUF 15,038')

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1)
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      })
      expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0]).toBe(
        screen.getByRole('form', { name: 'Currency converter' }),
      )
    })

    it('announces the currency chosen in the table to screen readers', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await screen.findByLabelText('Amount in CZK')
      await user.click(getButton('HUF'))

      expect(screen.getByText('Converter currency set to HUF – forint')).toBeInTheDocument()
    })

    it('scrolls instantly when the user prefers reduced motion', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await screen.findByLabelText('Amount in CZK')

      vi.mocked(window.matchMedia).mockImplementation(
        (query) => ({ matches: true, media: query }) as MediaQueryList,
      )

      await user.click(getButton('HUF'))

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'nearest',
      })
    })

    it('keeps the currency when the same one is clicked again', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await screen.findByLabelText('Amount in CZK')
      await user.click(getButton('HUF'))
      await user.click(getButton('HUF'))

      expect(getSelect()).toHaveValue('HUF')
      expect(getButton('HUF')).toHaveAttribute('aria-current', 'true')
    })

    it('clears the announcement when the currency is changed in the select', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await screen.findByLabelText('Amount in CZK')
      await user.click(getButton('HUF'))
      await user.selectOptions(getSelect(), 'JPY')

      expect(screen.queryByText(/Converter currency set to/)).not.toBeInTheDocument()
    })

    it('marks only the selected currency with aria-current', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await screen.findByLabelText('Amount in CZK')

      expect(getButton('EUR')).toHaveAttribute('aria-current', 'true')

      await user.click(getButton('HUF'))

      expect(getButton('HUF')).toHaveAttribute('aria-current', 'true')
      expect(getButton('EUR')).not.toHaveAttribute('aria-current')
      expect(
        within(screen.getByRole('table', { name: 'Exchange rates' }))
          .getAllByRole('button')
          .filter((button) => button.hasAttribute('aria-current')),
      ).toHaveLength(1)
    })

    it('selects a row by clicking outside the code button', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await user.click(await screen.findByRole('cell', { name: 'Hungary' }))

      expect(getSelect()).toHaveValue('HUF')
    })

    it('selects a currency with the keyboard', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await screen.findByLabelText('Amount in CZK')

      getButton('HUF').focus()
      await user.keyboard('{Enter}')

      expect(getSelect()).toHaveValue('HUF')

      getButton('JPY').focus()
      await user.keyboard(' ')

      expect(getSelect()).toHaveValue('JPY')
    })

    it('highlights the table row of a currency chosen in the select', async () => {
      const user = userEvent.setup()

      renderWithProviders(<App />)

      await user.selectOptions(await screen.findByLabelText('Currency'), 'JPY')

      expect(getButton('JPY')).toHaveAttribute('aria-current', 'true')
      expect(getButton('EUR')).not.toHaveAttribute('aria-current')
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
    })

    it('falls back to the default currency when the selected one disappears from new rates', async () => {
      const user = userEvent.setup()

      const { queryClient } = renderWithProviders(<App />)

      await user.click(await screen.findByRole('cell', { name: 'Hungary' }))

      expect(getSelect()).toHaveValue('HUF')

      server.use(
        http.get(RATES_URL, () =>
          HttpResponse.text(
            dailyTxt
              .split('\n')
              .filter((line) => !line.includes('|HUF|'))
              .join('\n'),
          ),
        ),
      )

      await queryClient.invalidateQueries()

      await waitFor(() => expect(screen.queryByRole('button', { name: /^Use HUF / })).toBeNull())

      expect(getSelect()).toHaveValue('EUR')
    })
  })
})
