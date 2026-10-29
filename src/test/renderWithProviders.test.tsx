import { useQueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import styled from 'styled-components'
import { describe, expect, it } from 'vitest'

import { theme } from '../styles/theme'
import { renderWithProviders } from './renderWithProviders'

const Box = styled.div`
  color: ${({ theme }) => theme.colors.primary};
`

function QueryClientProbe() {
  useQueryClient()

  return <p>query client available</p>
}

describe('renderWithProviders', () => {
  it('provides the theme to styled components', () => {
    renderWithProviders(<Box>themed</Box>)

    expect(screen.getByText('themed')).toHaveStyle({ color: theme.colors.primary })
  })

  it('provides a query client', () => {
    renderWithProviders(<QueryClientProbe />)

    expect(screen.getByText('query client available')).toBeInTheDocument()
  })
})
