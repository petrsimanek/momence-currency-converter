import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { ExchangeRate } from '../../api/cnb/types'
import { getInitialCode } from '../../lib/getInitialCode'
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

function Harness({ rates, initialCode }: { rates: ExchangeRate[]; initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? getInitialCode(rates))

  return <ConverterForm rates={rates} code={code} onCodeChange={setCode} />
}

const normalize = (text: string | null) => (text ?? '').replace(/\s/g, ' ')

const setup = (rates: ExchangeRate[]) => {
  const user = userEvent.setup()

  renderWithProviders(<Harness rates={rates} />)

  return user
}

const getAmountInput = () => screen.getByLabelText('Amount in CZK')
const getCurrencySelect = () => screen.getByLabelText('Currency')
const getResult = () => screen.getByRole('status')

const HINT = 'Type an amount in CZK to see it converted.'
const INVALID_HINT = 'Enter a valid amount to see the conversion.'
const FORMAT_HINT = 'Use a dot as the decimal separator, e.g. 1500.50'

describe('ConverterForm', () => {
  it('names the form', () => {
    renderWithProviders(<Harness rates={[eur]} />)

    expect(screen.getByRole('form', { name: 'Currency converter' })).toBeInTheDocument()
  })

  it('describes the amount input with a permanent format hint', () => {
    renderWithProviders(<Harness rates={[eur]} />)

    expect(getAmountInput()).toHaveAccessibleDescription(FORMAT_HINT)
  })

  it('shows a zero placeholder without replacing the format hint', () => {
    renderWithProviders(<Harness rates={[eur]} />)

    expect(getAmountInput()).toHaveAttribute('placeholder', '0')
    expect(getAmountInput()).toHaveValue('')
  })

  it('provides labelled amount and currency fields', () => {
    renderWithProviders(<Harness rates={[eur, huf]} />)

    expect(getAmountInput()).toBeInTheDocument()
    expect(getCurrencySelect()).toBeInTheDocument()
  })

  it('shows the currency given by the code prop', () => {
    renderWithProviders(<Harness rates={[huf, eur, usd]} initialCode="USD" />)

    expect(getCurrencySelect()).toHaveValue('USD')
  })

  it('reports the chosen currency through onCodeChange', async () => {
    const user = userEvent.setup()
    const onCodeChange = vi.fn()

    renderWithProviders(<ConverterForm rates={[eur, huf]} code="EUR" onCodeChange={onCodeChange} />)

    await user.selectOptions(getCurrencySelect(), 'HUF')

    expect(onCodeChange).toHaveBeenCalledWith('HUF')
  })

  it('converts into a changed code prop and keeps the entered amount', async () => {
    const user = userEvent.setup()

    const { rerender } = renderWithProviders(
      <ConverterForm rates={[eur, huf]} code="EUR" onCodeChange={() => {}} />,
    )

    await user.type(getAmountInput(), '1000')
    rerender(<ConverterForm rates={[eur, huf]} code="HUF" onCodeChange={() => {}} />)

    expect(getAmountInput()).toHaveValue('1000')
    expect(normalize(getResult().textContent)).toBe('CZK 1,000.00 = HUF 15,038')
  })

  it('forwards the ref to the form element', () => {
    const ref = { current: null as HTMLFormElement | null }

    renderWithProviders(
      <ConverterForm ref={ref} rates={[eur]} code="EUR" onCodeChange={() => {}} />,
    )

    expect(ref.current).toBe(screen.getByRole('form', { name: 'Currency converter' }))
  })

  it('shows currency details in the options', () => {
    renderWithProviders(<Harness rates={[eur]} />)

    expect(screen.getByRole('option', { name: 'EUR – euro (EMU)' })).toBeInTheDocument()
  })

  it('shows only the hint before anything is entered', () => {
    renderWithProviders(<Harness rates={[eur]} />)

    expect(normalize(getResult().textContent)).toBe(HINT)
  })

  it('shows the converted amount while typing', async () => {
    const user = setup([eur, huf])

    await user.type(getAmountInput(), '1000')

    expect(normalize(getResult().textContent)).toBe('CZK 1,000.00 = EUR 40.00')
  })

  it('hides the hint when a result is shown', async () => {
    const user = setup([eur])

    await user.type(getAmountInput(), '1000')

    expect(screen.queryByText(HINT)).not.toBeInTheDocument()
  })

  it('converts using the amount of the selected currency', async () => {
    const user = setup([eur, jpy])

    await user.type(getAmountInput(), '1000')
    await user.selectOptions(getCurrencySelect(), 'JPY')

    expect(normalize(getResult().textContent)).toBe('CZK 1,000.00 = JPY 6,667')
  })

  it.each([
    ['abc', 'Enter a valid non-negative number'],
    ['1,000', 'Use a dot as the decimal separator'],
  ])('shows the error for invalid input %s', async (input, message) => {
    const user = setup([eur])

    await user.type(getAmountInput(), input)

    expect(screen.getByText(message)).toBeVisible()
  })

  it('marks the input as invalid and links it to the error', async () => {
    const user = setup([eur])

    await user.type(getAmountInput(), 'abc')

    expect(getAmountInput()).toHaveAttribute('aria-invalid', 'true')
    expect(getAmountInput()).toHaveAccessibleDescription(
      `${FORMAT_HINT} Enter a valid non-negative number`,
    )
  })

  it('keeps the error inside an always present polite live region', async () => {
    const user = userEvent.setup()

    const { container } = renderWithProviders(<Harness rates={[eur]} />)

    const liveRegion = container.querySelector('[aria-live="polite"]')!

    expect(liveRegion).toBeEmptyDOMElement()

    await user.type(getAmountInput(), 'abc')

    expect(liveRegion).toHaveTextContent('Enter a valid non-negative number')
  })

  it('shows a neutral message and no result for invalid input', async () => {
    const user = setup([eur])

    await user.type(getAmountInput(), 'abc')

    expect(normalize(getResult().textContent)).toBe(INVALID_HINT)
  })

  it.each(['.5', '.50'])('accepts %s without an error', async (input) => {
    const user = setup([eur])

    await user.type(getAmountInput(), input)

    expect(getAmountInput()).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('does not announce the error as an alert', async () => {
    const user = setup([eur])

    await user.type(getAmountInput(), 'abc')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('accepts a trailing dot without an error', async () => {
    const user = setup([eur])

    await user.type(getAmountInput(), '12.')

    expect(getAmountInput()).not.toHaveAttribute('aria-invalid', 'true')
    expect(normalize(getResult().textContent)).toBe('CZK 12.00 = EUR 0.48')
  })

  it('returns to the hint after a result is cleared', async () => {
    const user = setup([eur])

    await user.type(getAmountInput(), '1000')
    await user.clear(getAmountInput())

    expect(normalize(getResult().textContent)).toBe(HINT)
  })

  it('clears the error and returns to the hint when the field is emptied', async () => {
    const user = setup([eur])

    await user.type(getAmountInput(), 'abc')
    await user.clear(getAmountInput())

    expect(getAmountInput()).not.toHaveAttribute('aria-invalid', 'true')
    expect(getAmountInput()).toHaveAccessibleDescription(FORMAT_HINT)
    expect(normalize(getResult().textContent)).toBe(HINT)
  })

  it('renders nothing for an empty list of rates', () => {
    const { container } = renderWithProviders(
      <ConverterForm rates={[]} code="EUR" onCodeChange={() => {}} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('prevents the default form submission', () => {
    renderWithProviders(<Harness rates={[eur]} />)

    const form = getAmountInput().closest('form')!

    expect(fireEvent.submit(form)).toBe(false)
  })
})
