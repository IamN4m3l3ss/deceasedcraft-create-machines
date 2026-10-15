<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BUILDS, type PartGroup } from '../data/builds'
import ItemIcon from '../components/ItemIcon.vue'
import BomPanel from '../components/BomPanel.vue'
import { loadLocal, saveLocal } from '../lib/store'

const sel = reactive<Record<string, number>>(loadLocal('dc-shopping', { ammo: 1, ring: 1, metal: 1, windmill: 1, thermo: 1 }))
watch(sel, () => saveLocal('dc-shopping', sel), { deep: true })
const sections = [
  { key: 'production', label: 'Production' }, { key: 'kinetic', label: 'Rotational power' }, { key: 'electric', label: 'Electricity' },
] as const
function toggle(id: string) { sel[id] = sel[id] ? 0 : 1 }
function bump(id: string, d: number) { sel[id] = Math.max(0, Math.min(99, (sel[id] || 0) + d)) }
const groups = computed<PartGroup[]>(() => {
  const out: PartGroup[] = []
  for (const b of BUILDS) {
    const n = sel[b.id] || 0
    if (!n) continue
    for (const g of b.parts) out.push({ label: `${b.title}${n > 1 ? ' × ' + n : ''} · ${g.label}`, note: g.note, optional: g.optional, items: g.items.map(([id, q]) => [id, q * n]) })
  }
  return out
})
const count = computed(() => Object.values(sel).filter((v) => v > 0).length)
function preset(ids: string[]) { for (const b of BUILDS) sel[b.id] = ids.includes(b.id) ? 1 : 0 }
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="big-icon"><ItemIcon id="minecraft:chest" :size="40" /></div>
      <div>
        <div class="eyebrow">Reference</div>
        <h1>Shopping list</h1>
        <p>Tick the builds you want and get one combined list: every part, the raw materials behind them, and a crafting plan in an order that works. Your picks are saved in this browser.</p>
      </div>
    </div>

    <div class="split">
      <div class="stack">
        <section class="card">
          <header class="card-h"><h2>Builds</h2><span class="chip">{{ count }} picked</span></header>
          <div class="card-b">
            <div class="row wrap" style="gap: 6px; margin-bottom: 14px">
              <span class="eyebrow" style="margin-right: 4px">Presets</span>
              <button class="btn sm" type="button" @click="preset(['ammo', 'ring', 'metal', 'windmill', 'thermo'])">New world</button>
              <button class="btn sm" type="button" @click="preset(['ammo', 'ring', 'metal', 'boiler4', 'altbank'])">Mid game</button>
              <button class="btn sm" type="button" @click="preset(['boiler18', 'bigbank'])">Late boiler</button>
              <button class="btn sm" type="button" @click="preset(['diesel'])">Diesel plant</button>
              <button class="btn sm ghost" type="button" @click="preset([])">Clear</button>
            </div>
            <div v-for="s in sections" :key="s.key" class="sec">
              <div class="eyebrow" style="margin: 8px 0 6px">{{ s.label }}</div>
              <div v-for="b in BUILDS.filter((x) => x.section === s.key)" :key="b.id" class="pick" :class="{ on: sel[b.id] > 0 }">
                <label class="pl">
                  <input type="checkbox" :checked="sel[b.id] > 0" @change="toggle(b.id)" />
                  <ItemIcon :id="b.icon" :size="22" />
                  <span class="grow"><b>{{ b.title }}</b><small>{{ b.tagline }}</small></span>
                </label>
                <div class="qty" v-if="sel[b.id] > 0">
                  <button type="button" aria-label="One fewer" @click="bump(b.id, -1)">−</button>
                  <span>{{ sel[b.id] }}</span>
                  <button type="button" aria-label="One more" @click="bump(b.id, 1)">+</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div>
        <BomPanel v-if="groups.length" :groups="groups" title="Combined list" />
        <section v-else class="card"><div class="card-b"><p class="muted" style="margin: 0">Pick at least one build.</p></div></section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pick { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 9px; border: 1px solid transparent; }
.pick.on { background: var(--surface-2); border-color: var(--border); }
.pl { flex: 1; display: flex; align-items: center; gap: 10px; cursor: pointer; min-width: 0; }
.pl input { width: 16px; height: 16px; accent-color: var(--accent); }
.pl b { display: block; font-size: 14px; font-weight: 600; }
.pl small { display: block; font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.qty { display: inline-flex; align-items: center; border: 1px solid var(--border-2); border-radius: 8px; overflow: hidden; }
.qty button { width: 28px; height: 28px; border: 0; background: var(--surface-3); cursor: pointer; font-weight: 700; }
.qty span { min-width: 28px; text-align: center; font: 600 13px var(--mono); }
</style>
