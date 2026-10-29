import type { ReactNode } from 'react'
import styled, { keyframes } from 'styled-components'

type StatusMessageProps = {
  role: 'status' | 'alert'
  isLoading?: boolean
  children: ReactNode
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const Message = styled.div<{ $inline: boolean }>`
  display: flex;
  flex-direction: ${({ $inline }) => ($inline ? 'row' : 'column')};
  align-items: ${({ $inline }) => ($inline ? 'center' : 'flex-start')};
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.card};
  color: ${({ theme }) => theme.colors.text};

  &[role='alert'] {
    border-color: ${({ theme }) => theme.colors.danger};
    background: ${({ theme }) => theme.colors.dangerSurface};
    color: ${({ theme }) => theme.colors.danger};
  }
`

const Spinner = styled.span`
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export function StatusMessage({ role, isLoading = false, children }: StatusMessageProps) {
  return (
    <Message role={role} $inline={isLoading}>
      {isLoading && <Spinner aria-hidden="true" />}

      {children}
    </Message>
  )
}
