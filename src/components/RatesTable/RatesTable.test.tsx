import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
    renderWithProviders(<RatesTable rates={rates} />)

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent)

    expect(headers).toEqual(['Country', 'Currency', 'Code', 'Amount', 'Rate (CZK)'])
  })

  it('renders a row for every currency plus the header row', () => {
    renderWithProviders(<RatesTable rates={rates} />)

    expect(screen.getAllByRole('row')).toHaveLength(rates.length + 1)
  })

  it('renders the HUF row with amount 100 and a rate with three decimals', () => {
    renderWithProviders(<RatesTable rates={rates} />)

    const row = screen.getByRole('row', { name: /HUF/ })

    expect(within(row).getByRole('cell', { name: 'Hungary' })).toBeInTheDocument()
    expect(within(row).getByRole('cell', { name: '100' })).toBeInTheDocument()
    expect(within(row).getByRole('cell', { name: '6.100' })).toBeInTheDocument()
  })

  it('names the table by its caption', () => {
    renderWithProviders(<RatesTable rates={rates} />)

    expect(screen.getByRole('table', { name: 'Exchange rates' })).toBeInTheDocument()
  })

  it('renders only the header row for an empty list', () => {
    renderWithProviders(<RatesTable rates={[]} />)

    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})
