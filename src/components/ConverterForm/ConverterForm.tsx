import { zodResolver } from '@hookform/resolvers/zod'
import { type Ref, useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import styled, { css } from 'styled-components'
import { z } from 'zod'

import type { ExchangeRate } from '../../api/cnb/types'
import { convertFromCzk } from '../../lib/convertFromCzk'
import { formatMoney } from '../../lib/formatMoney'
import { type AmountParseResult, amountFieldSchema, parseAmount } from '../../lib/parseAmount'
import { ErrorIcon } from '../ErrorIcon/ErrorIcon'

type ConverterFormProps = {
  rates: ExchangeRate[]
  code: string
  onCodeChange: (code: string) => void
  ref?: Ref<HTMLFormElement>
}

type ConversionResult = {
  source: string
  target: string
}

const EMPTY_HINT = 'Type an amount in CZK to see it converted.'
const INVALID_HINT = 'Enter a valid amount to see the conversion.'

const ignoreSubmit = () => {}

const formSchema = z.object({
  amount: amountFieldSchema,
})

type FormValues = z.infer<typeof formSchema>

const Form = styled.form`
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.onPrimarySurface};
  box-shadow: ${({ theme }) => theme.shadow.card};
  color: ${({ theme }) => theme.colors.primaryText};

  & :focus-visible {
    outline-color: ${({ theme }) => theme.colors.focusOnDark};
  }
`

const Fields = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 3fr 2fr;
    align-items: start;
    padding: ${({ theme }) => theme.space.lg};
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  min-width: 0;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
`

const controlStyles = css`
  width: 100%;
  min-height: 3rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
`

const Input = styled.input<{ $invalid: boolean }>`
  ${controlStyles}
  background: ${({ theme, $invalid }) =>
    $invalid ? theme.colors.dangerSurface : theme.colors.surface};
`

// Safari ignores height and padding on a native select, so the native look is replaced by a custom arrow.
const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E")`

const Select = styled.select`
  ${controlStyles}
  appearance: none;
  height: 3rem;
  padding-right: 2.5rem;
  background-image: ${SELECT_ARROW};
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  line-height: 1.5;
  text-overflow: ellipsis;
`

const FieldHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.onPrimaryMuted};
  font-size: 0.875rem;
`

const ErrorMessage = styled.p`
  display: flex;
  gap: 0.375rem;
  align-items: flex-start;
  margin: 0;
  padding: 0.375rem 0.625rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.dangerSurface};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.875rem;

  svg {
    margin-top: 0.15rem;
  }
`

const Result = styled.output`
  display: block;
  min-height: 8rem;
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onPrimarySurface};
  font-variant-numeric: tabular-nums;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    min-height: 9.5rem;
    padding: ${({ theme }) => theme.space.lg};
  }
`

const Source = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.125rem;
  font-weight: 600;
`

const Equals = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1.125rem;
`

const Target = styled.span`
  display: block;
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  overflow-wrap: anywhere;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 3.5rem;
  }
`

const Hint = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`

function getConversion(
  parsed: AmountParseResult,
  rate: ExchangeRate | undefined,
): ConversionResult | null {
  if (parsed.status !== 'valid' || !rate) {
    return null
  }

  return {
    source: formatMoney(parsed.value, 'CZK'),
    target: formatMoney(convertFromCzk(parsed.value, rate), rate.code),
  }
}

function ConverterFormFields({ rates, code, onCodeChange, ref }: ConverterFormProps) {
  const amountId = useId()
  const currencyId = useId()
  const hintId = useId()
  const errorId = useId()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: { amount: '' },
  })

  const amountText = useWatch({ control, name: 'amount' })

  const errorMessage = errors.amount?.message
  const isInvalid = errorMessage !== undefined
  const parsedAmount = parseAmount(amountText)
  const conversion = getConversion(
    parsedAmount,
    rates.find((rate) => rate.code === code),
  )

  return (
    <Form ref={ref} aria-label="Currency converter" onSubmit={handleSubmit(ignoreSubmit)}>
      <Fields>
        <Field>
          <Label htmlFor={amountId}>Amount in CZK</Label>

          <Input
            id={amountId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid ? `${hintId} ${errorId}` : hintId}
            $invalid={isInvalid}
            {...register('amount')}
          />

          <FieldHint id={hintId}>Use a dot as the decimal separator, e.g. 1500.50</FieldHint>

          <div aria-live="polite">
            {errorMessage && (
              <ErrorMessage id={errorId}>
                <ErrorIcon />

                <span>{errorMessage}</span>
              </ErrorMessage>
            )}
          </div>
        </Field>

        <Field>
          <Label htmlFor={currencyId}>Currency</Label>

          <Select
            id={currencyId}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
          >
            {rates.map((rate) => (
              <option key={rate.code} value={rate.code}>
                {`${rate.code} – ${rate.currency} (${rate.country})`}
              </option>
            ))}
          </Select>
        </Field>
      </Fields>

      <Result htmlFor={`${amountId} ${currencyId}`}>
        {conversion ? (
          <>
            <Source>{conversion.source}</Source> <Equals>=</Equals>{' '}
            <Target>{conversion.target}</Target>
          </>
        ) : (
          <Hint>{parsedAmount.status === 'invalid' ? INVALID_HINT : EMPTY_HINT}</Hint>
        )}
      </Result>
    </Form>
  )
}

export function ConverterForm(props: ConverterFormProps) {
  if (props.rates.length === 0) {
    return null
  }

  return <ConverterFormFields {...props} />
}
