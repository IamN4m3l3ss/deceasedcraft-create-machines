// What each production line can make, and how to set it up for each product: what goes in the
// input chest, what each station holds, which filters to set. The 3D view loads the same setup.
import { CALIBERS, KITS } from './ammo'

export interface LineMode {
  id: string
  /** the product */
  out: string
  label: string
  group: string
  /** what you put in the input chest */
  input: string
  /** station name → item it holds (null: leave it as it is, not used for this product) */
  held: Record<string, string | null>
  /** filters to set */
  filters?: { where: string; items: string[] }[]
  /** what the item on the belt turns into, after which station */
  swaps: [string, string][]
  /** build variant this product needs (when the default one can't make it) */
  variant?: string
  note?: string
}
export interface Line {
  stations: string[]; modes: LineMode[]; defaultMode: string; hint: string
  /** what a station keeps when a product doesn't use it */
  idle?: Record<string, string>
}
/** what the 3D view needs to show a product: input, deployer items, how the item changes */
export function lineLoad(line: Line, modeId: string) {
  const m = line.modes.find((x) => x.id === modeId) || line.modes[0]
  const held: Record<string, string> = { ...(line.idle || {}) }
  for (const [k, v] of Object.entries(m.held)) if (v) held[k] = v
  return { input: m.input, held, swaps: m.swaps }
}

// ---------------- ammo ----------------
const ammoModes: LineMode[] = CALIBERS.map((c) => {
  const heavy = c.steps.length > 2
  const held: Record<string, string | null> = { D1: c.steps[0], D2: c.steps[1] }
  if (heavy) held.D3 = c.steps[2]
  const group = c.tier === 'early' ? 'Early game' : c.tier === 'mid' ? 'Mid game' : 'Late game'
  return {
    id: c.id, out: c.round, label: c.label, group, input: c.casing, held,
    swaps: [[heavy ? 'D3' : 'D2', c.round]],
    variant: heavy ? 'heavy' : undefined,
    note: `${c.use}. ${c.brassBlock ? 'The IE Metal Press makes 2 casings per Block of Brass' : `The IE Metal Press makes ${c.perBrass} casing${c.perBrass > 1 ? 's' : ''} per brass ingot`} with the ${c.label} mold.`,
  }
})

// ---------------- parts ring ----------------
const ringModes: LineMode[] = KITS.map((k) => ({
  id: k.id, out: k.item, label: k.label + (k.attachment ? ' parts' : ' kit'), group: k.attachment ? 'Attachments' : 'Gun kits',
  input: 'apocalypsenow:cardboard_box',
  held: { S1: k.blueprint, S2: 'immersiveengineering:stick_steel', S3: 'immersiveengineering:plate_steel', S4: 'createbigcannons:recoil_spring', S5: 'immersiveengineering:component_steel', S6: k.special },
  filters: [{ where: 'Exit brass funnel', items: [k.item] }],
  swaps: [],
  note: k.attachment
    ? 'One lap. S4 keeps its springs: attachment parts skip that step, so nothing is taken from it.'
    : `Four laps, so each kit takes 4 of every S2–S6 item. ${k.use}.`,
}))

// ---------------- metalworks ----------------
const sheet = (id: string, label: string, ingot: string, out: string, group = 'Plates and sheets'): LineMode => ({
  id, out, label, group, input: ingot, held: {}, swaps: [['P1', out]],
  filters: [{ where: 'Saw', items: ['createbigcannons:spring_wire'] }],
  note: 'Only the first press works on it; the other two let it pass. The saw lets it pass because of its filter.',
})
const metalModes: LineMode[] = [
  sheet('plate', 'Steel Plate', 'immersiveengineering:ingot_steel', 'immersiveengineering:plate_steel'),
  {
    id: 'spring', out: 'createbigcannons:recoil_spring', label: 'Recoil Spring', group: 'Gun parts', input: 'immersiveengineering:plate_steel', held: {},
    filters: [{ where: 'Saw', items: ['createbigcannons:spring_wire'] }],
    swaps: [['X', 'createbigcannons:spring_wire'], ['P3', 'createbigcannons:recoil_spring']],
    note: 'The saw cuts each plate into 3 spring wires, then the three presses squeeze each wire into a spring. Without the filter the saw makes steel wire every other time.',
  },
  sheet('iron', 'Iron Sheet', 'minecraft:iron_ingot', 'create:iron_sheet'),
  sheet('copper', 'Copper Sheet', 'minecraft:copper_ingot', 'create:copper_sheet'),
  sheet('brass', 'Brass Sheet', 'create:brass_ingot', 'create:brass_sheet'),
  sheet('gold', 'Golden Sheet', 'minecraft:gold_ingot', 'create:golden_sheet'),
  sheet('zinc', 'Zinc Sheet', 'create:zinc_ingot', 'createaddition:zinc_sheet'),
  sheet('lead', 'Lead Plate', 'immersiveengineering:ingot_lead', 'immersiveengineering:plate_lead'),
  sheet('aluminum', 'Aluminum Plate', 'immersiveengineering:ingot_aluminum', 'immersiveengineering:plate_aluminum'),
  sheet('constantan', 'Constantan Plate', 'immersiveengineering:ingot_constantan', 'immersiveengineering:plate_constantan'),
  sheet('electrum', 'Electrum Plate', 'immersiveengineering:ingot_electrum', 'immersiveengineering:plate_electrum'),
]

export const LINES: Record<string, Line> = {
  ammo: { stations: ['D1', 'D2', 'D3'], modes: ammoModes, defaultMode: '9mm', idle: { D3: 'immersiveengineering:storage_lead' }, hint: 'Pick a round to see what goes where. Every standard caliber uses the same two deployer items, so switching is just a different casing.' },
  ring: { stations: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'], modes: ringModes, defaultMode: 'pistol', hint: 'Pick a kit. Only S1 (blueprint), S6 (special material) and the exit filter change between kits.' },
  metal: { stations: ['X', 'P1', 'P2', 'P3'], modes: metalModes, defaultMode: 'spring', hint: 'Pick what to make. The line itself never changes; only what you drop into the input chest does.' },
}
