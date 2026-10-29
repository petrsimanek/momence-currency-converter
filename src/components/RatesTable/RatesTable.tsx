import styled, { css } from 'styled-components'

import type { ExchangeRate } from '../../api/cnb/types'
import { visuallyHidden } from '../../styles/visuallyHidden'

type RatesTableProps = {
  rates: ExchangeRate[]
  selectedCode: string
  onSelect: (code: string) => void
}

type Column = 'country' | 'currency' | 'code' | 'amount' | 'rate'

type CellProps = {
  $column?: Column
  $numeric?: boolean
  $hiddenOnMobile?: boolean
}

const mobileOnly = (styles: ReturnType<typeof css>) => css`
  @media not all and (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${styles}
  }
`

const blockOnMobile = mobileOnly(css`
  display: block;
`)

const cellPadding = css`
  padding: 0.625rem ${({ theme }) => theme.space.md};
`

const Card = styled.div`
  position: relative;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.card};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  ${blockOnMobile}
`

const Caption = styled.caption`
  padding: ${({ theme }) => theme.space.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1.125rem;
  font-weight: 600;
  text-align: left;

  ${blockOnMobile}
`

const Head = styled.thead`
  ${mobileOnly(visuallyHidden)}
`

const Body = styled.tbody`
  ${blockOnMobile}
`

const HeaderCell = styled.th<{ $numeric?: boolean }>`
  ${cellPadding}
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
`

const Row = styled.tr<{ $selected: boolean }>`
  cursor: pointer;

  &:hover td {
    background: ${({ theme }) => theme.colors.surfaceMuted};
  }

  &:last-child td {
    border-bottom: 0;
  }

  ${({ $selected, theme }) =>
    $selected &&
    css`
      td,
      &:hover td {
        background: ${theme.colors.selectedRow};
      }

      td:first-child {
        box-shadow: inset 0.25rem 0 0 ${theme.colors.primary};
      }
    `}

  ${({ $selected, theme }) =>
    mobileOnly(css`
      display: grid;
      grid-template-columns: 3.5rem 1fr auto;
      grid-template-areas:
        'code currency rate'
        'code country amount';
      column-gap: ${theme.space.sm};
      align-items: baseline;
      ${cellPadding}
      border-bottom: 1px solid ${theme.colors.border};
      background: ${$selected ? theme.colors.selectedRow : 'transparent'};
      box-shadow: ${$selected ? `inset 0.25rem 0 0 ${theme.colors.primary}` : 'none'};

      &:last-child {
        border-bottom: 0;
      }

      td,
      td:first-child,
      &:hover td {
        background: transparent;
        box-shadow: none;
      }

      &:hover {
        background: ${$selected ? theme.colors.selectedRow : theme.colors.surfaceMuted};
      }
    `)}
`

const CodeButton = styled.button`
  display: block;
  width: 100%;
  min-height: 2.75rem;
  margin: -0.625rem 0;
  padding: 0.625rem 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }

  ${mobileOnly(css`
    min-height: 2.75rem;
    margin: 0;
    padding: 0;
  `)}
`

const mobileColumnStyles: Record<Column, ReturnType<typeof css>> = {
  code: css`
    align-self: center;
    font-size: 1.0625rem;
    font-weight: 700;
  `,
  currency: css``,
  country: css`
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8125rem;
  `,
  amount: css`
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8125rem;

    &::before {
      content: 'per ';
    }
  `,
  rate: css`
    font-size: 1.0625rem;
  `,
}

const Cell = styled.td<CellProps>`
  ${cellPadding}
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
  font-variant-numeric: ${({ $numeric }) => ($numeric ? 'tabular-nums' : 'normal')};
  font-weight: ${({ $column }) => ($column === 'rate' ? 600 : 'inherit')};

  ${({ $column }) =>
    $column &&
    mobileOnly(css`
      grid-area: ${$column};
      padding: 0;
      border: 0;
      text-align: left;
      ${mobileColumnStyles[$column]}
    `)}

  ${({ $hiddenOnMobile }) => $hiddenOnMobile && mobileOnly(visuallyHidden)}
`

function formatRate(rate: number): string {
  return rate.toLocaleString('en', { minimumFractionDigits: 3 })
}

export function RatesTable({ rates, selectedCode, onSelect }: RatesTableProps) {
  return (
    <Card>
      {/* Explicit roles keep the table semantics when display: block/grid removes them on mobile. */}
      <Table role="table">
        <Caption>Exchange rates</Caption>

        <Head role="rowgroup">
          <tr role="row">
            <HeaderCell role="columnheader" scope="col">
              Country
            </HeaderCell>
            <HeaderCell role="columnheader" scope="col">
              Currency
            </HeaderCell>
            <HeaderCell role="columnheader" scope="col">
              Code
            </HeaderCell>
            <HeaderCell role="columnheader" scope="col" $numeric>
              Amount
            </HeaderCell>
            <HeaderCell role="columnheader" scope="col" $numeric>
              Rate (CZK)
            </HeaderCell>
          </tr>
        </Head>

        <Body role="rowgroup">
          {rates.map(({ code, country, currency, amount, rate }) => (
            <Row
              key={code}
              role="row"
              $selected={code === selectedCode}
              onClick={() => onSelect(code)}
            >
              <Cell role="cell" $column="country">
                {country}
              </Cell>
              <Cell role="cell" $column="currency">
                {currency}
              </Cell>
              <Cell role="cell" $column="code">
                <CodeButton
                  type="button"
                  aria-label={`Use ${code} – ${currency} in the converter`}
                  aria-current={code === selectedCode || undefined}
                >
                  {code}
                </CodeButton>
              </Cell>
              <Cell role="cell" $column="amount" $numeric $hiddenOnMobile={amount === 1}>
                {amount}
              </Cell>
              <Cell role="cell" $column="rate" $numeric>
                {formatRate(rate)}
              </Cell>
            </Row>
          ))}
        </Body>
      </Table>
    </Card>
  )
}
