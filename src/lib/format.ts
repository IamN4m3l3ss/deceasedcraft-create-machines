import { item } from '../data/items'

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

export function num(n: number): string { return nf.format(n) }

/** "1,234" for items, "12.5 B" / "250 mB" for fluids */
export function qty(id: string, q: number): string {
  if (item(id).fluid) return q >= 1000 ? `${nf.format(q / 1000)} B` : `${nf.format(q)} mB`
  return nf.format(Math.ceil(q - 1e-9))
}

/** short count for item slots: 1–999, then 1.2k */
export function slotCount(id: string, q: number): string {
  if (item(id).fluid) return q >= 1000 ? `${+(q / 1000).toFixed(1)}B` : `${q}mB`
  const n = Math.ceil(q - 1e-9)
  if (n < 1000) return String(n)
  return `${+(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`
}

/** "3 stacks + 12" helper text */
export function stacks(id: string, q: number): string {
  if (item(id).fluid) return q >= 1000 ? `${nf.format(q)} mB` : ''
  const n = Math.ceil(q - 1e-9)
  if (n < 64) return ''
  const s = Math.floor(n / 64), r = n % 64
  return `${s} stack${s > 1 ? 's' : ''}${r ? ` + ${r}` : ''}`
}
