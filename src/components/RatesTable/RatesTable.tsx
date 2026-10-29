import type { ExchangeRate } from '../../api/cnb/types'
import { CurrencyFlag } from '../CurrencyFlag/CurrencyFlag'
import * as S from './RatesTable.styles'

type RatesTableProps = {
  rates: ExchangeRate[]
  selectedCode: string
  onSelect: (code: string) => void
}

function formatRate(rate: number): string {
  return rate.toLocaleString('en', { minimumFractionDigits: 3 })
}

export function RatesTable({ rates, selectedCode, onSelect }: RatesTableProps) {
  return (
    <S.Card>
      {/* Explicit roles keep the table semantics when display: block/grid removes them on mobile. */}
      <S.Table role="table">
        <S.Caption>Exchange rates</S.Caption>

        <S.Head role="rowgroup">
          <tr role="row">
            <S.HeaderCell role="columnheader" scope="col">
              Country
            </S.HeaderCell>
            <S.HeaderCell role="columnheader" scope="col">
              Currency
            </S.HeaderCell>
            <S.HeaderCell role="columnheader" scope="col">
              Code
            </S.HeaderCell>
            <S.HeaderCell role="columnheader" scope="col" $numeric>
              Amount
            </S.HeaderCell>
            <S.HeaderCell role="columnheader" scope="col" $numeric>
              Rate (CZK)
            </S.HeaderCell>
          </tr>
        </S.Head>

        <S.Body role="rowgroup">
          {rates.map(({ code, country, currency, amount, rate }) => (
            <S.Row
              key={code}
              role="row"
              $selected={code === selectedCode}
              onClick={() => onSelect(code)}
            >
              <S.Cell role="cell" $column="country">
                {country}
              </S.Cell>
              <S.Cell role="cell" $column="currency">
                {currency}
              </S.Cell>
              <S.Cell role="cell" $column="code">
                <S.CodeButton
                  type="button"
                  aria-label={`Use ${code} – ${currency} in the converter`}
                  aria-current={code === selectedCode || undefined}
                >
                  <CurrencyFlag code={code} />

                  {code}
                </S.CodeButton>
              </S.Cell>
              <S.Cell role="cell" $column="amount" $numeric $hiddenOnMobile={amount === 1}>
                {amount}
              </S.Cell>
              <S.Cell role="cell" $column="rate" $numeric>
                {formatRate(rate)}
              </S.Cell>
            </S.Row>
          ))}
        </S.Body>
      </S.Table>
    </S.Card>
  )
}
