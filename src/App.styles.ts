import styled from 'styled-components'

import { visuallyHidden } from './styles/visuallyHidden'

export const Page = styled.main`
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

export const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.01em;
  line-height: 1.2;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.75rem;
  }
`

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const VisuallyHidden = styled.div`
  ${visuallyHidden}
`

export const ErrorText = styled.span`
  display: inline-flex;
  gap: 0.375rem;
  align-items: center;
  font-weight: 600;
`

export const RetryButton = styled.button`
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
