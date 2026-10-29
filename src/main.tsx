import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'

import { ExchangeRatesParseError } from './api/cnb/parseExchangeRates'
import App from './App'
import { GlobalStyle } from './styles/GlobalStyle'
import { theme } from './styles/theme'

const MAX_RETRIES = 1

function shouldRetry(failureCount: number, error: Error) {
  return !(error instanceof ExchangeRatesParseError) && failureCount < MAX_RETRIES
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />

        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
