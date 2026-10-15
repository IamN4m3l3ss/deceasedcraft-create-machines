import { PRIMARY, type Recipe, type Stack } from '../data/recipes'
import { item } from '../data/items'

export interface CraftLine { recipe: Recipe; runs: number; made: number; need: number }
export interface Bom { raw: Stack[]; crafts: CraftLine[]; stations: string[] }
export interface BomOptions { baseMetals?: boolean }

function isLeaf(id: string, o: BomOptions): boolean {
  const it = item(id)
  if (it.raw) return true
  if (it.alloy && !o.baseMetals) return true
  return !PRIMARY[id]
}

/** Total raw materials for a list of finished items. Crafts are batched per item, so leftovers from
 *  one craft (e.g. 8 shafts per recipe) are shared across everything in the list. */
export function computeBom(targets: Stack[], o: BomOptions = {}): Bom {
  const order: string[] = []
  const seen = new Set<string>()
  const visit = (id: string) => {
    if (seen.has(id)) return
    seen.add(id)
    if (!isLeaf(id, o)) for (const [dep] of PRIMARY[id].in) visit(dep)
    order.push(id) // post-order: inputs before the things made from them
  }
  for (const [id] of targets) visit(id)

  const need: Record<string, number> = {}
  for (const [id, q] of targets) need[id] = (need[id] || 0) + q
  const crafts: CraftLine[] = []
  const raw: Record<string, number> = {}
  for (let i = order.length - 1; i >= 0; i--) {
    const id = order[i], q = need[id] || 0
    if (q <= 0) continue
    if (isLeaf(id, o)) { raw[id] = (raw[id] || 0) + q; continue }
    const r = PRIMARY[id]
    const runs = Math.ceil(q / r.n - 1e-9)
    crafts.push({ recipe: r, runs, made: runs * r.n, need: q })
    for (const [dep, k] of r.in) need[dep] = (need[dep] || 0) + k * runs
  }
  crafts.reverse() // build order: make the inputs first
  const stations = [...new Set(crafts.map((c) => c.recipe.station))]
  const rawList = Object.entries(raw).sort((a, b) => Number(item(a[0]).fluid) - Number(item(b[0]).fluid) || b[1] - a[1])
  return { raw: rawList, crafts, stations }
}

export function mergeStacks(lists: Stack[][]): Stack[] {
  const m = new Map<string, number>()
  for (const l of lists) for (const [id, q] of l) m.set(id, (m.get(id) || 0) + q)
  return [...m.entries()]
}
