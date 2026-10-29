import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import styled, { css } from 'styled-components'
import { z } from 'zod'

import type { ExchangeRate } from '../../api/cnb/types'
import { convertFromCzk } from '../../lib/convertFromCzk'
import { formatMoney } from '../../lib/formatMoney'
import { amountFieldSchema, parseAmount } from '../../lib/parseAmount'

type ConverterFormProps = {
  rates: ExchangeRate[]
}

const DEFAULT_CODE = 'EUR'

const ignoreSubmit = () => {}

const formSchema = z.object({
  amount: amountFieldSchema,
  currency: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    align-items: flex-start;
  }
`

const Field = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
`

const controlStyles = css`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 0.375rem;
  background: ${({ theme }) => theme.colors.surface};
  color: inherit;
  font: inherit;
`

const Input = styled.input<{ $invalid: boolean }>`
  ${controlStyles}
  border-color: ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.borderStrong)};
  background: ${({ theme, $invalid }) =>
    $invalid ? theme.colors.dangerSurface : theme.colors.surface};
`

const Select = styled.select`
  ${controlStyles}
`

const ErrorMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.875rem;
`

const Result = styled.output`
  display: block;
  min-height: 1.75rem;
  font-size: 1.25rem;
  font-weight: 600;
`

function getInitialCode(rates: ExchangeRate[]): string {
  const hasDefault = rates.some((rate) => rate.code === DEFAULT_CODE)

  return hasDefault ? DEFAULT_CODE : rates[0].code
}

function formatResult(amountText: string, rate: ExchangeRate | undefined): string {
  const parsed = parseAmount(amountText)

  if (parsed.status !== 'valid' || !rate) {
    return ''
  }

  const converted = formatMoney(convertFromCzk(parsed.value, rate), rate.code)

  return `${formatMoney(parsed.value, 'CZK')} = ${converted}`
}

function ConverterFormFields({ rates }: ConverterFormProps) {
  const amountId = useId()
  const currencyId = useId()
  const errorId = useId()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '', currency: getInitialCode(rates) },
  })

  const [amountText, code] = useWatch({ control, name: ['amount', 'currency'] })

  const errorMessage = errors.amount?.message
  const isInvalid = errorMessage !== undefined
  const result = formatResult(
    amountText,
    rates.find((rate) => rate.code === code),
  )

  return (
    <Form onSubmit={handleSubmit(ignoreSubmit)}>
      <Fields>
        <Field>
          <Label htmlFor={amountId}>Amount in CZK</Label>

          <Input
            id={amountId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 1500.50"
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid ? errorId : undefined}
            $invalid={isInvalid}
            {...register('amount')}
          />

          {errorMessage && <ErrorMessage id={errorId}>{errorMessage}</ErrorMessage>}
        </Field>

        <Field>
          <Label htmlFor={currencyId}>Currency</Label>

          <Select id={currencyId} {...register('currency')}>
            {rates.map((rate) => (
              <option key={rate.code} value={rate.code}>
                {`${rate.code} – ${rate.currency} (${rate.country})`}
              </option>
            ))}
          </Select>
        </Field>
      </Fields>

      <Result htmlFor={`${amountId} ${currencyId}`}>{result}</Result>
    </Form>
  )
}

export function ConverterForm({ rates }: ConverterFormProps) {
  if (rates.length === 0) {
    return null
  }

  return <ConverterFormFields rates={rates} />
}
