import styled from 'styled-components'

import type { ExchangeRate } from '../../api/cnb/types'

type RatesTableProps = {
  rates: ExchangeRate[]
}

const Scroller = styled.div`
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`

const Caption = styled.caption`
  padding: ${({ theme }) => theme.space.sm} 0;
  font-size: 1.125rem;
  font-weight: 600;
  text-align: left;
`

const HeaderCell = styled.th<{ $numeric?: boolean }>`
  padding: ${({ theme }) => `${theme.space.sm} ${theme.space.md}`};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
`

const Row = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Cell = styled.td<{ $numeric?: boolean }>`
  padding: ${({ theme }) => `${theme.space.sm} ${theme.space.md}`};
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
  font-variant-numeric: ${({ $numeric }) => ($numeric ? 'tabular-nums' : 'normal')};
`

export function RatesTable({ rates }: RatesTableProps) {
  return (
    <Scroller>
      <Table>
        <Caption>Exchange rates</Caption>
        <thead>
          <tr>
            <HeaderCell scope="col">Country</HeaderCell>
            <HeaderCell scope="col">Currency</HeaderCell>
            <HeaderCell scope="col">Code</HeaderCell>
            <HeaderCell scope="col" $numeric>
              Amount
            </HeaderCell>
            <HeaderCell scope="col" $numeric>
              Rate (CZK)
            </HeaderCell>
          </tr>
        </thead>
        <tbody>
          {rates.map(({ code, country, currency, amount, rate }) => (
            <Row key={code}>
              <Cell>{country}</Cell>
              <Cell>{currency}</Cell>
              <Cell>{code}</Cell>
              <Cell $numeric>{amount}</Cell>
              <Cell $numeric>{rate.toLocaleString('en', { minimumFractionDigits: 3 })}</Cell>
            </Row>
          ))}
        </tbody>
      </Table>
    </Scroller>
  )
}
