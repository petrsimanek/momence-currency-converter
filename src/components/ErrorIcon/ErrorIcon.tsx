import styled from 'styled-components'

const Icon = styled.svg`
  flex: none;
`

export function ErrorIcon() {
  return (
    <Icon width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />

      <path
        d="M8 4.5v4.2M8 10.6v.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </Icon>
  )
}
