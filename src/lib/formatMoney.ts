export function formatMoney(value: number, currencyCode: string): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'code',
  }).format(value)
}
