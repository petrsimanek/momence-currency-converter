import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'
import { renderWithProviders } from './test/renderWithProviders'

describe('App', () => {
  it('renders the main heading', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { name: 'Exchange rates' })).toBeInTheDocument()
  })
})
