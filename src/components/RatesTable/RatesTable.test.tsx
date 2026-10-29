import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ExchangeRate } from '../../api/cnb/types'
import { renderWithProviders } from '../../test/renderWithProviders'
import { RatesTable } from './RatesTable'

const rates: ExchangeRate[] = [
  { country: 'EMU', currency: 'euro', amount: 1, code: 'EUR', rate: 25 },
  { country: 'Hungary', currency: 'forint', amount: 100, code: 'HUF', rate: 6.1 },
  { country: 'Japan', currency: 'yen', amount: 100, code: 'JPY', rate: 14.52 },
]

describe('RatesTable', () => {
  it('renders column headers in order', () => {
    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={() => {}} />)

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent)

    expect(headers).toEqual(['Country', 'Currency', 'Code', 'Amount', 'Rate (CZK)'])
  })

  it('renders a row for every currency plus the header row', () => {
    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={() => {}} />)

    expect(screen.getAllByRole('row')).toHaveLength(rates.length + 1)
  })

  it('renders the HUF row with amount 100 and a rate with three decimals', () => {
    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={() => {}} />)

    const row = screen.getByRole('row', { name: /HUF/ })

    expect(within(row).getByRole('cell', { name: 'Hungary' })).toBeInTheDocument()
    expect(within(row).getByRole('cell', { name: '100' })).toBeInTheDocument()
    expect(within(row).getByRole('cell', { name: '6.100' })).toBeInTheDocument()
  })

  it('names the table by its caption', () => {
    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={() => {}} />)

    expect(screen.getByRole('table', { name: 'Exchange rates' })).toBeInTheDocument()
  })

  it('renders only the header row for an empty list', () => {
    renderWithProviders(<RatesTable rates={[]} selectedCode="EUR" onSelect={() => {}} />)

    expect(screen.getAllByRole('row')).toHaveLength(1)
  })

  it('renders the code of every currency as a button', () => {
    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={() => {}} />)

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'EUR',
      'HUF',
      'JPY',
    ])
  })

  it('marks only the selected currency with aria-current', () => {
    renderWithProviders(<RatesTable rates={rates} selectedCode="HUF" onSelect={() => {}} />)

    expect(screen.getByRole('button', { name: /^Use HUF / })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: /^Use EUR / })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('button', { name: /^Use JPY / })).not.toHaveAttribute('aria-current')
  })

  it('calls onSelect once when the code button is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /^Use JPY / }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('JPY')
  })

  it('calls onSelect when any cell of a row is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={onSelect} />)

    await user.click(screen.getByRole('cell', { name: 'Hungary' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('HUF')
  })

  it.each(['{Enter}', ' '])('selects a currency with the keyboard (%j)', async (key) => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderWithProviders(<RatesTable rates={rates} selectedCode="EUR" onSelect={onSelect} />)

    screen.getByRole('button', { name: /^Use HUF / }).focus()
    await user.keyboard(key)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('HUF')
  })
})
