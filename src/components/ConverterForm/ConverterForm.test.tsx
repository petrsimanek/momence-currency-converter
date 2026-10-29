import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { ExchangeRate } from '../../api/cnb/types'
import { renderWithProviders } from '../../test/renderWithProviders'
import { ConverterForm } from './ConverterForm'

const eur: ExchangeRate = { country: 'EMU', currency: 'euro', amount: 1, code: 'EUR', rate: 25 }
const huf: ExchangeRate = {
  country: 'Hungary',
  currency: 'forint',
  amount: 100,
  code: 'HUF',
  rate: 6.65,
}
const jpy: ExchangeRate = {
  country: 'Japan',
  currency: 'yen',
  amount: 100,
  code: 'JPY',
  rate: 15,
}
const usd: ExchangeRate = { country: 'USA', currency: 'dollar', amount: 1, code: 'USD', rate: 22 }

const normalize = (text: string | null) => (text ?? '').replace(/\s/g, ' ')

const getAmountInput = () => screen.getByLabelText('Amount in CZK')
const getCurrencySelect = () => screen.getByLabelText('Currency')
const getResult = () => screen.getByRole('status')

describe('ConverterForm', () => {
  it('provides labelled amount and currency fields', () => {
    renderWithProviders(<ConverterForm rates={[eur, huf]} />)

    expect(getAmountInput()).toBeInTheDocument()
    expect(getCurrencySelect()).toBeInTheDocument()
  })

  it('selects EUR by default', () => {
    renderWithProviders(<ConverterForm rates={[huf, eur, usd]} />)

    expect(getCurrencySelect()).toHaveValue('EUR')
  })

  it('selects the first currency when EUR is missing', () => {
    renderWithProviders(<ConverterForm rates={[huf, usd]} />)

    expect(getCurrencySelect()).toHaveValue('HUF')
  })

  it('shows currency details in the options', () => {
    renderWithProviders(<ConverterForm rates={[eur]} />)

    expect(screen.getByRole('option', { name: 'EUR – euro (EMU)' })).toBeInTheDocument()
  })

  it('shows the converted amount while typing', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur, huf]} />)

    await user.type(getAmountInput(), '1000')

    expect(normalize(getResult().textContent)).toBe('CZK 1,000.00 = EUR 40.00')
  })

  it('converts using the amount of the selected currency', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur, jpy]} />)

    await user.type(getAmountInput(), '1000')
    await user.selectOptions(getCurrencySelect(), 'JPY')

    expect(normalize(getResult().textContent)).toBe('CZK 1,000.00 = JPY 6,667')
  })

  it.each([
    ['abc', 'Enter a valid non-negative number'],
    ['1,000', 'Use a dot as the decimal separator'],
  ])('shows the error for invalid input %s', async (input, message) => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur]} />)

    await user.type(getAmountInput(), input)

    expect(screen.getByText(message)).toBeVisible()
  })

  it('marks the input as invalid and links it to the error', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur]} />)

    await user.type(getAmountInput(), 'abc')

    expect(getAmountInput()).toHaveAttribute('aria-invalid', 'true')
    expect(getAmountInput()).toHaveAccessibleDescription('Enter a valid non-negative number')
  })

  it('shows no result for invalid input', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur]} />)

    await user.type(getAmountInput(), 'abc')

    expect(getResult()).toBeEmptyDOMElement()
  })

  it('does not announce the error as an alert', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur]} />)

    await user.type(getAmountInput(), 'abc')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('accepts a trailing dot without an error', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur]} />)

    await user.type(getAmountInput(), '12.')

    expect(getAmountInput()).not.toHaveAttribute('aria-invalid', 'true')
    expect(normalize(getResult().textContent)).toBe('CZK 12.00 = EUR 0.48')
  })

  it('clears the error and result when the field is emptied', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ConverterForm rates={[eur]} />)

    await user.type(getAmountInput(), 'abc')
    await user.clear(getAmountInput())

    expect(getAmountInput()).not.toHaveAttribute('aria-invalid', 'true')
    expect(getAmountInput()).not.toHaveAccessibleDescription()
    expect(getResult()).toBeEmptyDOMElement()
  })

  it('renders nothing for an empty list of rates', () => {
    const { container } = renderWithProviders(<ConverterForm rates={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('prevents the default form submission', () => {
    renderWithProviders(<ConverterForm rates={[eur]} />)

    const form = getAmountInput().closest('form')!

    expect(fireEvent.submit(form)).toBe(false)
  })
})
