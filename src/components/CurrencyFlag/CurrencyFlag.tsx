import {
  type FlagComponent,
  AU,
  BR,
  CA,
  CH,
  CN,
  DK,
  EU,
  GB,
  HK,
  HU,
  ID,
  IL,
  IN,
  IS,
  JP,
  KR,
  MX,
  MY,
  NO,
  NZ,
  PH,
  PL,
  RO,
  SE,
  SG,
  TH,
  TR,
  US,
  ZA,
} from 'country-flag-icons/react/1x1'
import styled from 'styled-components'

type CurrencyFlagProps = {
  code: string
}

// Flags are matched by currency code because that is what the CNB file provides.
const FLAGS: Record<string, FlagComponent> = {
  AUD: AU,
  BRL: BR,
  CAD: CA,
  CHF: CH,
  CNY: CN,
  DKK: DK,
  EUR: EU,
  GBP: GB,
  HKD: HK,
  HUF: HU,
  IDR: ID,
  ILS: IL,
  INR: IN,
  ISK: IS,
  JPY: JP,
  KRW: KR,
  MXN: MX,
  MYR: MY,
  NOK: NO,
  NZD: NZ,
  PHP: PH,
  PLN: PL,
  RON: RO,
  SEK: SE,
  SGD: SG,
  THB: TH,
  TRY: TR,
  USD: US,
  ZAR: ZA,
}

const Frame = styled.span`
  display: inline-flex;
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  overflow: hidden;
  border-radius: 50%;

  svg {
    width: 100%;
    height: 100%;
  }
`

const NeutralFrame = styled(Frame)`
  background: ${({ theme }) => theme.colors.surfaceMuted};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
`

// Used for currencies without a country flag, e.g. the IMF special drawing rights (XDR).
function NeutralIcon() {
  return (
    <NeutralFrame aria-hidden>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="10" cy="10" r="5.5" />

        <ellipse cx="10" cy="10" rx="2.5" ry="5.5" />

        <path d="M4.5 10h11" />
      </svg>
    </NeutralFrame>
  )
}

export function CurrencyFlag({ code }: CurrencyFlagProps) {
  const Flag = FLAGS[code]

  // The flag is decoration: the currency code is always shown next to it as text.
  if (!Flag) {
    return <NeutralIcon />
  }

  return (
    <Frame aria-hidden>
      <Flag />
    </Frame>
  )
}
