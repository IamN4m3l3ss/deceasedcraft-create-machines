<script setup lang="ts">
import { computed } from 'vue'
import type { Layer } from '../data/builds'

const props = defineProps<{ layer: Layer; zs: number[] }>()
const DIR: Record<string, string> = { '>': 'east', '<': 'west', '^': 'north', v: 'south' }
const ARR: Record<string, string> = { '>': '→', '<': '←', '^': '↑', v: '↓' }
interface Cell { cls: string; txt: string; tip: string; badge?: string; badge2?: string }
const MAP: Record<string, Cell> = {
  Ci: { cls: 'k-chest', txt: 'IN', tip: 'Input chest' }, Co: { cls: 'k-chest', txt: 'OUT', tip: 'Output chest' },
  G: { cls: 'k-kin', txt: 'GB', tip: 'Gearbox' }, 'S-': { cls: 'k-kin', txt: '━', tip: 'Shaft, east–west' },
  'S|': { cls: 'k-kin', txt: '┃', tip: 'Shaft, north–south' }, So: { cls: 'k-kin', txt: '◉', tip: 'Vertical shaft' },
  Pw: { cls: 'k-power', txt: 'PWR', tip: 'Power in from above' }, H: { cls: 'k-feed', txt: 'H', tip: 'Hopper into the deployer below' },
  P: { cls: 'k-press', txt: 'PR', tip: 'Mechanical press, shaft along the row' },
  X: { cls: 'k-press', txt: 'SAW', tip: 'Saw facing up, shaft north–south, filter: Spring Wire' },
  c: { cls: 'k-kin', txt: '⚙', tip: 'Cogwheel, north–south axis' },
  Tg: { cls: 'k-gen', txt: 'TE', tip: 'Thermoelectric generator' }, Lv: { cls: 'k-lava', txt: 'L', tip: 'Lava (or magma block)' },
  Wa: { cls: 'k-water', txt: 'W', tip: 'Water source' }, St: { cls: 'k-stone', txt: '', tip: 'Stone (any block)' },
  Gl: { cls: 'k-glass', txt: '', tip: 'Glass, keeps the fluids in' }, Cn: { cls: 'k-press', txt: 'LV', tip: 'LV wire connector on the generator’s north face' },
  Rc: { cls: 'k-rc', txt: '', tip: 'Reinforced reactor casing' }, Rk: { cls: 'k-rk', txt: 'CTL', tip: 'Reactor controller' },
  Rt: { cls: 'k-rt', txt: 'FE', tip: 'Active power port' }, Ra: { cls: 'k-ra', txt: 'AP', tip: 'Solid access port (fuel in / waste out)' },
  Rf: { cls: 'k-rf', txt: 'F', tip: 'Fuel rod' }, Rr: { cls: 'k-rr', txt: 'CR', tip: 'Control rod' },
  Rp: { cls: 'k-port', txt: 'FP', tip: 'Active fluid port (water in or steam out)' }, Rw: { cls: 'k-port', txt: 'H₂O', tip: 'Active fluid port, input: make-up water from the pumps' },
  Wl: { cls: 'k-wheel', txt: '⟲', tip: 'Crushing wheel, axle north–south (left wheel)' }, Wr: { cls: 'k-wheel', txt: '⟳', tip: 'Crushing wheel, axle north–south (right wheel)' },
  'z+': { cls: 'k-kin', txt: '⚙', tip: 'Cogwheel, axle north–south' }, 'z-': { cls: 'k-kin', txt: '⚙', tip: 'Cogwheel, axle north–south' },
  Fd: { cls: 'k-feed', txt: '▼', tip: 'Andesite funnel facing down, under the generator' },
  Gn: { cls: 'k-gen', txt: 'GEN', tip: 'Mechanical Generator (Create Cobblestone), axle north–south' },
  Hs: { cls: 'k-feed', txt: 'H→', tip: 'Hopper pointing south into the chest' },
  Tc: { cls: 'k-tc', txt: '', tip: 'Reinforced turbine casing' }, Tk: { cls: 'k-rk', txt: 'CTL', tip: 'Turbine controller' },
  Tb: { cls: 'k-kin', txt: 'BRG', tip: 'Rotor bearing (the rotor starts here)' }, Ts: { cls: 'k-kin', txt: '◉', tip: 'Rotor shaft' },
  Tl: { cls: 'k-blade', txt: '✕', tip: 'Rotor blade' }, Te: { cls: 'k-coil', txt: 'E', tip: 'Block of Electrum (coil)' },
  Tt: { cls: 'k-rt', txt: 'FE', tip: 'Active power port' }, Tp: { cls: 'k-port', txt: 'FP', tip: 'Turbine fluid port (steam in or water out)' },
}
function cell(tok: string): Cell {
  if (tok === '.') return { cls: '', txt: '', tip: 'Empty' }
  if (tok === '~') return { cls: 'k-gap', txt: '·', tip: 'Keep clear: the gap a deployer or press reaches through' }
  if (tok[0] === 'B' && '<>^v'.includes(tok[1])) {
    const d = tok[1], f = tok.slice(2); let tip = 'Belt moving ' + DIR[d], b = '', b2 = ''
    if (f.includes('*')) { b2 = '⊙'; tip += ', pulley' }
    if (f.includes('i')) { b = 'IN'; tip += ', funnel pulling from the chest' }
    if (f.includes('o')) { b = 'OUT'; tip += ', sneak-placed funnel into the chest' }
    if (f.includes('b')) { b = 'EXIT'; tip += ', sneak-placed brass funnel with kit filter' }
    return { cls: 'k-belt', txt: ARR[d], badge: b, badge2: b2, tip }
  }
  if (MAP[tok]) return MAP[tok]
  if (/^[DS]\d$/.test(tok)) return { cls: 'k-dep', txt: tok, tip: 'Deployer ' + tok + ', facing down' }
  if (/^P\d$/.test(tok)) return { cls: 'k-press', txt: tok, tip: 'Mechanical press ' + tok + ', shaft along the row' }
  return { cls: '', txt: tok, tip: tok }
}
const rows = computed(() => props.layer.rows.map((r) => r.split(' ').map(cell)))
const cols = computed(() => rows.value[0]?.length || 0)
</script>

<template>
  <div class="lg-wrap">
    <div class="lg" :style="{ gridTemplateColumns: `auto repeat(${cols}, 34px)` }" role="table" :aria-label="layer.name">
      <div class="ax">N↑</div>
      <div v-for="x in cols" :key="'x' + x" class="ax">x{{ x - 1 }}</div>
      <template v-for="(row, zi) in rows" :key="zi">
        <div class="ax">z{{ zs[zi] }}</div>
        <div v-for="(c, xi) in row" :key="zi + '-' + xi" class="c" :class="c.cls" :title="c.tip" :aria-label="c.tip">
          {{ c.txt }}<span v-if="c.badge" class="b1">{{ c.badge }}</span><span v-if="c.badge2" class="b2">{{ c.badge2 }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.lg-wrap { overflow-x: auto; padding-bottom: 4px; }
.lg { display: grid; gap: 3px; width: max-content; }
.ax { font: 600 11px var(--mono); color: var(--muted); display: grid; place-items: center; min-width: 26px; height: 22px; }
.c { position: relative; width: 34px; height: 34px; border-radius: 6px; background: var(--bg-2); border: 1px solid var(--border); display: grid; place-items: center; font: 700 11px var(--mono); color: var(--text-2); }
.b1 { position: absolute; top: -7px; left: 50%; transform: translateX(-50%); font-size: 8.5px; padding: 0 3px; border-radius: 3px; background: var(--accent); color: var(--accent-ink); line-height: 12px; }
.b2 { position: absolute; bottom: 0; right: 2px; font-size: 10px; color: var(--muted); }
.k-belt { background: #2b2f35; color: #dfe3e8; font-size: 15px; }
.k-chest { background: #5a4126; border-color: #7a5a36; color: #ffe9c9; font-size: 9.5px; }
.k-kin { background: #3a3f46; color: #e8c27a; }
.k-power { background: var(--green-soft); border-color: var(--green); color: var(--green); font-size: 9px; }
.k-feed { background: #2a2d31; color: #9aa1ab; }
.k-press { background: #4a5058; color: #f1f3f5; font-size: 9px; }
.k-dep { background: #6a5320; border-color: var(--accent); color: #ffe7b0; }
.k-gap { color: var(--muted); border-style: dashed; }
.k-gen { background: #8a5a3a; color: #ffe1c9; font-size: 10px; }
.k-lava { background: #b2501a; border-color: #ff7a1a; color: #ffe0c0; }
.k-water { background: #1f4f87; border-color: #3f86d8; color: #d9eaff; }
.k-stone { background: #55575a; }
.k-glass { background: rgba(191, 227, 238, 0.12); border-color: rgba(191, 227, 238, 0.35); }
.k-rc { background: #4b5058; border-color: #5d636c; }
.k-port { background: #1f3f66; border-color: var(--blue); color: #d9eaff; font-size: 9px; }
.k-wheel { background: #6b5a43; border-color: #8f7a5a; color: #f1e3c8; font-size: 14px; }
.k-tc { background: #59606a; border-color: #6c737d; }
.k-blade { background: #3a3f46; color: #c9ced3; }
.k-coil { background: #8a7a2e; border-color: #ecd66e; color: #fff6cc; }
.k-rk { background: #3c4048; border-color: var(--green); color: var(--green); font-size: 9px; }
.k-rt { background: #5a2a26; border-color: var(--red); color: #ffd0ca; font-size: 10px; }
.k-ra { background: #5d4a1f; border-color: var(--accent); color: #ffe7b0; font-size: 10px; }
.k-rf { background: #2f5a2a; border-color: #78c850; color: #d9ffd0; }
.k-rr { background: #2b2d31; border-color: #d2be46; color: #f5e58c; font-size: 10px; }
</style>
