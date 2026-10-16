<script setup lang="ts">
import { computed } from 'vue'
import type { Line, LineMode } from '../data/lines'
import { item } from '../data/items'
import ItemIcon from './ItemIcon.vue'
import ItemSlot from './ItemSlot.vue'

const props = defineProps<{ line: Line; mode: string; stations: string[]; variant: string; variants: { id: string; label: string }[] }>()
const emit = defineEmits<{ (e: 'mode', id: string): void; (e: 'variant', id: string): void }>()

const m = computed<LineMode>(() => props.line.modes.find((x) => x.id === props.mode) || props.line.modes[0])
const groups = computed(() => {
  const out: { name: string; modes: LineMode[] }[] = []
  for (const x of props.line.modes) {
    let g = out.find((o) => o.name === x.group)
    if (!g) out.push((g = { name: x.group, modes: [] }))
    g.modes.push(x)
  }
  return out
})
const needs = computed(() => (m.value.variant && m.value.variant !== props.variant ? props.variants.find((v) => v.id === m.value.variant) : null))
const hands = computed(() => props.stations.filter((s) => /^[DS]\d$/.test(s)))
function holds(st: string): { id: string | null; idle: boolean } {
  const h = m.value.held[st]
  if (h) return { id: h, idle: false }
  const idle = props.line.idle && props.line.idle[st]
  return { id: idle || null, idle: !!idle }
}
const usedUp = (st: string, id: string | null) => !!id && !/blueprint/.test(id)
</script>

<template>
  <section class="card lp">
    <header class="card-h">
      <h2>What it makes</h2>
      <span class="small muted">{{ line.modes.length }} products</span>
    </header>
    <div class="card-b">
      <p class="small hint">{{ line.hint }}</p>
      <div v-for="g in groups" :key="g.name" class="grp">
        <span class="eyebrow">{{ g.name }}</span>
        <div class="chips">
          <button v-for="x in g.modes" :key="x.id" type="button" class="pick" :aria-pressed="x.id === m.id" @click="emit('mode', x.id)">
            <ItemIcon :id="x.out" :size="20" />
            <span>{{ x.label }}</span>
            <span v-if="x.variant && x.variant !== variant" class="tagv">{{ variants.find((v) => v.id === x.variant)?.label }}</span>
          </button>
        </div>
      </div>

      <div class="detail">
        <div class="flow">
          <div class="fcol">
            <span class="eyebrow">Input chest</span>
            <div class="row" style="gap: 8px"><ItemSlot :id="m.input" :size="28" /><span class="nm">{{ item(m.input).name }}</span></div>
          </div>
          <span class="arrow" aria-hidden="true">→</span>
          <div class="fcol">
            <span class="eyebrow">Comes out</span>
            <div class="row" style="gap: 8px"><ItemSlot :id="m.out" :size="28" /><span class="nm">{{ item(m.out).name }}</span></div>
          </div>
        </div>

        <div v-if="needs" class="needs">
          <span>{{ m.label }} needs the <b>{{ needs.label }}</b> version of this line.</span>
          <button class="btn sm" type="button" @click="emit('variant', needs.id)">Switch to {{ needs.label }}</button>
        </div>

        <table v-if="hands.length" class="st">
          <thead><tr><th>Deployer</th><th>Keep in it</th><th></th></tr></thead>
          <tbody>
            <tr v-for="s in hands" :key="s">
              <td class="mono">{{ s }}</td>
              <td>
                <div v-if="holds(s).id" class="row" style="gap: 8px">
                  <ItemSlot :id="holds(s).id!" :size="22" :kept="!usedUp(s, holds(s).id)" />
                  <span>{{ item(holds(s).id!).name }}</span>
                </div>
                <span v-else class="muted">nothing needed</span>
              </td>
              <td class="small muted">{{ holds(s).idle ? 'not used, just keeps it from jamming' : holds(s).id && !usedUp(s, holds(s).id) ? 'never used up' : '' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="m.filters?.length" class="filters">
          <div v-for="f in m.filters" :key="f.where" class="row wrap" style="gap: 8px">
            <span class="eyebrow">Filter on {{ f.where }}</span>
            <ItemSlot v-for="id in f.items" :key="id" :id="id" :size="22" />
            <span class="small">{{ f.items.map((i) => item(i).name).join(', ') }}</span>
          </div>
        </div>
        <p v-if="m.note" class="small note">{{ m.note }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hint { margin-bottom: 12px; }
.grp { margin-bottom: 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pick {
  display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 11px 0 7px; border-radius: 9px;
  border: 1px solid var(--border-2); background: var(--surface-2); cursor: pointer; font-size: 13px; font-weight: 500;
}
.pick:hover { border-color: var(--accent); }
.pick[aria-pressed='true'] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-2); }
.tagv { font-size: 11px; color: var(--muted); border: 1px solid var(--border-2); border-radius: 5px; padding: 0 5px; }
.detail { margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--border); }
.flow { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.fcol { display: flex; flex-direction: column; gap: 6px; }
.nm { font-weight: 600; font-size: 14px; }
.arrow { color: var(--accent); font-size: 22px; }
.needs { margin-top: 12px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 10px 12px; border-radius: 9px; background: var(--blue-soft); font-size: 14px; }
.st { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 14px; }
.st th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 600; padding: 0 8px 6px 0; }
.st td { padding: 6px 8px 6px 0; border-top: 1px solid var(--border); vertical-align: middle; }
.filters { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.note { margin: 12px 0 0; }
</style>
