import { useEffect, useRef, useState } from 'react'

import * as S from './App.styles'
import { ConverterForm } from './components/ConverterForm/ConverterForm'
import { ErrorIcon } from './components/ErrorIcon/ErrorIcon'
import { RatesTable } from './components/RatesTable/RatesTable'
import { StatusMessage } from './components/StatusMessage/StatusMessage'
import { useExchangeRates } from './hooks/useExchangeRates'
import { getInitialCode } from './lib/getInitialCode'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function ExchangeRatesContent() {
  const { data, error, isPending, refetch } = useExchangeRates()
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const converterRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])

  if (data?.rates.length === 0) {
    return <StatusMessage role="status">No exchange rates available.</StatusMessage>
  }

  if (data) {
    const selectedRate = data.rates.find((rate) => rate.code === selectedCode)
    const code = selectedRate?.code ?? getInitialCode(data.rates)

    const handleCodeChange = (nextCode: string) => {
      setSelectedCode(nextCode)
      setAnnouncement('')
    }

    const handleSelect = (nextCode: string) => {
      const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
      const nextRate = data.rates.find((rate) => rate.code === nextCode)

      setSelectedCode(nextCode)
      setAnnouncement(`Converter currency set to ${nextCode} – ${nextRate?.currency}`)

      converterRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      })
    }

    return (
      <>
        <S.Subtitle>{`Rates valid for ${data.date} (#${data.sequence})`}</S.Subtitle>
        <ConverterForm
          ref={converterRef}
          rates={data.rates}
          code={code}
          onCodeChange={handleCodeChange}
        />
        <S.VisuallyHidden role="status">{announcement}</S.VisuallyHidden>
        <RatesTable rates={data.rates} selectedCode={code} onSelect={handleSelect} />
      </>
    )
  }

  if (isPending) {
    return (
      <StatusMessage role="status" isLoading>
        Loading exchange rates…
      </StatusMessage>
    )
  }

  return (
    <StatusMessage role="alert">
      <S.ErrorText>
        <ErrorIcon />
        Could not load exchange rates.
      </S.ErrorText>
      <S.RetryButton type="button" onClick={() => refetch()}>
        Try again
      </S.RetryButton>
    </StatusMessage>
  )
}

function App() {
  return (
    <S.Page>
      <S.Title>CNB exchange rates</S.Title>
      <ExchangeRatesContent />
    </S.Page>
  )
}

export default App
