export function convertFromCzk(czk: number, rate: { amount: number; rate: number }): number {
  return (czk * rate.amount) / rate.rate
}
