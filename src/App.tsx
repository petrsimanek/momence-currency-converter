import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { ConverterForm } from './components/ConverterForm/ConverterForm'
import { ErrorIcon } from './components/ErrorIcon/ErrorIcon'
import { RatesTable } from './components/RatesTable/RatesTable'
import { StatusMessage } from './components/StatusMessage/StatusMessage'
import { useExchangeRates } from './hooks/useExchangeRates'
import { getInitialCode } from './lib/getInitialCode'
import { visuallyHidden } from './styles/visuallyHidden'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
  max-width: 46rem;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.space.lg} ${theme.space.md}`};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-top: ${({ theme }) => theme.space.xl};
    padding-bottom: ${({ theme }) => theme.space.xl};
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.01em;
  line-height: 1.2;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.75rem;
  }
`

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`

const VisuallyHidden = styled.div`
  ${visuallyHidden}
`

const ErrorText = styled.span`
  display: inline-flex;
  gap: 0.375rem;
  align-items: center;
  font-weight: 600;
`

const RetryButton = styled.button`
  min-height: 2.75rem;
  padding: 0 ${({ theme }) => theme.space.lg};
  border: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`

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
        <Subtitle>{`Rates valid for ${data.date} (#${data.sequence})`}</Subtitle>
        <ConverterForm
          ref={converterRef}
          rates={data.rates}
          code={code}
          onCodeChange={handleCodeChange}
        />
        <VisuallyHidden role="status">{announcement}</VisuallyHidden>
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
      <ErrorText>
        <ErrorIcon />
        Could not load exchange rates.
      </ErrorText>
      <RetryButton type="button" onClick={() => refetch()}>
        Try again
      </RetryButton>
    </StatusMessage>
  )
}

function App() {
  return (
    <Page>
      <Title>CNB exchange rates</Title>
      <ExchangeRatesContent />
    </Page>
  )
}

export default App
