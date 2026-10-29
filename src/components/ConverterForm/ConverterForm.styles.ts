import styled, { css } from 'styled-components'

export const Form = styled.form`
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.onPrimarySurface};
  box-shadow: ${({ theme }) => theme.shadow.card};
  color: ${({ theme }) => theme.colors.primaryText};

  & :focus-visible {
    outline-color: ${({ theme }) => theme.colors.focusOnDark};
  }
`

export const Fields = styled.div`
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

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  min-width: 0;
`

export const Label = styled.label`
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

export const Input = styled.input<{ $invalid: boolean }>`
  ${controlStyles}
  background: ${({ theme, $invalid }) =>
    $invalid ? theme.colors.dangerSurface : theme.colors.surface};
`

// Safari ignores height and padding on a native select, so the native look is replaced by a custom arrow.
const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E")`

export const Select = styled.select`
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

export const FieldHint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.onPrimaryMuted};
  font-size: 0.875rem;
`

export const ErrorMessage = styled.p`
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

export const Result = styled.output`
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

export const Source = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.125rem;
  font-weight: 600;
`

export const Equals = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1.125rem;
`

export const Target = styled.span`
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

export const Hint = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`
