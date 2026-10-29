import { zodResolver } from '@hookform/resolvers/zod'
import { type Ref, useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import type { ExchangeRate } from '../../api/cnb/types'
import { convertFromCzk } from '../../lib/convertFromCzk'
import { formatMoney } from '../../lib/formatMoney'
import { type AmountParseResult, amountFieldSchema, parseAmount } from '../../lib/parseAmount'
import { ErrorIcon } from '../ErrorIcon/ErrorIcon'
import * as S from './ConverterForm.styles'

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
    <S.Form ref={ref} aria-label="Currency converter" onSubmit={handleSubmit(ignoreSubmit)}>
      <S.Fields>
        <S.Field>
          <S.Label htmlFor={amountId}>Amount in CZK</S.Label>

          <S.Input
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

          <S.FieldHint id={hintId}>Use a dot as the decimal separator, e.g. 1500.50</S.FieldHint>

          <div aria-live="polite">
            {errorMessage && (
              <S.ErrorMessage id={errorId}>
                <ErrorIcon />

                <span>{errorMessage}</span>
              </S.ErrorMessage>
            )}
          </div>
        </S.Field>

        <S.Field>
          <S.Label htmlFor={currencyId}>Currency</S.Label>

          <S.Select
            id={currencyId}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
          >
            {rates.map((rate) => (
              <option key={rate.code} value={rate.code}>
                {`${rate.code} – ${rate.currency} (${rate.country})`}
              </option>
            ))}
          </S.Select>
        </S.Field>
      </S.Fields>

      <S.Result htmlFor={`${amountId} ${currencyId}`}>
        {conversion ? (
          <>
            <S.Source>{conversion.source}</S.Source> <S.Equals>=</S.Equals>{' '}
            <S.Target>{conversion.target}</S.Target>
          </>
        ) : (
          <S.Hint>{parsedAmount.status === 'invalid' ? INVALID_HINT : EMPTY_HINT}</S.Hint>
        )}
      </S.Result>
    </S.Form>
  )
}

export function ConverterForm(props: ConverterFormProps) {
  if (props.rates.length === 0) {
    return null
  }

  return <ConverterFormFields {...props} />
}
