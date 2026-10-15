<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PartGroup } from '../data/builds'
import type { Stack } from '../data/recipes'
import { computeBom, mergeStacks } from '../lib/bom'
import { station } from '../data/stations'
import { item } from '../data/items'
import { qty, num } from '../lib/format'
import ItemRow from './ItemRow.vue'
import ItemSlot from './ItemSlot.vue'
import ItemIcon from './ItemIcon.vue'

const props = withDefaults(defineProps<{ groups: PartGroup[]; title?: string; multiplier?: number }>(), { title: 'What you need', multiplier: 1 })
const tab = ref<'parts' | 'raw' | 'plan'>('parts')
const withOptional = ref(true)
const baseMetals = ref(false)
const copied = ref(false)

const activeGroups = computed(() => props.groups.filter((g) => withOptional.value || !g.optional))
const parts = computed<Stack[]>(() => mergeStacks(activeGroups.value.map((g) => g.items)).map(([id, q]) => [id, q * props.multiplier] as Stack))
const bom = computed(() => computeBom(parts.value, { baseMetals: baseMetals.value }))
const hasOptional = computed(() => props.groups.some((g) => g.optional))
const rawItems = computed(() => bom.value.raw.filter(([id]) => !item(id).fluid))
const rawFluids = computed(() => bom.value.raw.filter(([id]) => item(id).fluid))
const totalCrafts = computed(() => bom.value.crafts.reduce((a, c) => a + c.runs, 0))

function copy() {
  const lines: string[] = []
  const list = tab.value === 'raw' ? bom.value.raw : parts.value
  lines.push(tab.value === 'raw' ? 'Raw materials:' : 'Parts:')
  for (const [id, q] of list) lines.push(`${qty(id, q)}× ${item(id).name}`)
  navigator.clipboard?.writeText(lines.join('\n')).then(() => { copied.value = true; setTimeout(() => (copied.value = false), 1500) })
}
</script>

<template>
  <section class="card bom">
    <header class="card-h">
      <h2>{{ title }}</h2>
      <button class="btn sm ghost" type="button" @click="copy" :title="'Copy the ' + (tab === 'raw' ? 'raw materials' : 'parts') + ' as text'">{{ copied ? 'Copied' : 'Copy' }}</button>
    </header>
    <div class="bar">
      <div class="seg" role="group" aria-label="View">
        <button type="button" :aria-pressed="tab === 'parts'" @click="tab = 'parts'">Parts</button>
        <button type="button" :aria-pressed="tab === 'raw'" @click="tab = 'raw'">Raw materials</button>
        <button type="button" :aria-pressed="tab === 'plan'" @click="tab = 'plan'">Crafting plan</button>
      </div>
      <label v-if="hasOptional" class="switch"><input type="checkbox" v-model="withOptional" /> Optional parts</label>
    </div>

    <div v-if="tab === 'parts'" class="card-b">
      <div v-for="g in activeGroups" :key="g.label" class="grp">
        <div class="gh"><span class="eyebrow">{{ g.label }}</span><span v-if="g.optional" class="chip">optional</span></div>
        <p v-if="g.note" class="gn">{{ g.note }}</p>
        <ul class="list"><ItemRow v-for="[id, q] in g.items" :key="g.label + id" :id="id" :n="q * multiplier" /></ul>
      </div>
    </div>

    <div v-else-if="tab === 'raw'" class="card-b">
      <div class="row wrap" style="justify-content: space-between; margin-bottom: 8px">
        <span class="muted small">Everything above, broken down to things you mine, farm or smelt. Crafts are batched, so leftovers are shared.</span>
        <label class="switch"><input type="checkbox" v-model="baseMetals" /> Break alloys into base metals</label>
      </div>
      <ul class="list"><ItemRow v-for="[id, q] in rawItems" :key="id" :id="id" :n="q" /></ul>
      <template v-if="rawFluids.length">
        <div class="gh" style="margin-top: 14px"><span class="eyebrow">Fluids</span></div>
        <ul class="list"><ItemRow v-for="[id, q] in rawFluids" :key="id" :id="id" :n="q" /></ul>
      </template>
    </div>

    <div v-else class="card-b">
      <div class="stations">
        <span class="eyebrow">Stations you’ll use</span>
        <div class="row wrap" style="gap: 6px; margin-top: 8px">
          <span v-for="s in bom.stations" :key="s" class="chip" :title="station(s).how"><ItemIcon :id="station(s).icon" :size="14" />{{ station(s).name }}</span>
        </div>
      </div>
      <p class="muted small" style="margin: 14px 0 8px">{{ bom.crafts.length }} different items, {{ num(totalCrafts) }} crafts in total, in an order that works: each line only uses things made above it.</p>
      <ol class="plan">
        <li v-for="c in bom.crafts" :key="c.recipe.id">
          <ItemSlot :id="c.recipe.out" :n="c.made" :size="24" />
          <div class="pl-b">
            <div class="pl-t"><b>{{ item(c.recipe.out).name }}</b> <span class="muted">× {{ qty(c.recipe.out, c.made) }}</span></div>
            <div class="pl-s"><ItemIcon :id="station(c.recipe.station).icon" :size="14" /> {{ station(c.recipe.station).name }} · {{ num(c.runs) }} {{ c.runs === 1 ? 'run' : 'runs' }}</div>
          </div>
          <div class="pl-in">
            <ItemSlot v-for="[id, q] in c.recipe.in" :key="id" :id="id" :n="q * c.runs" :size="18" />
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px 0; flex-wrap: wrap; }
.list { list-style: none; margin: 0; padding: 0; }
.grp + .grp { margin-top: 18px; }
.gh { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; padding: 0 8px; }
.gn { font-size: 13px; color: var(--muted); margin: 0 0 6px; padding: 0 8px; }
.stations { padding: 0 2px; }
.plan { list-style: none; margin: 0; padding: 0; counter-reset: p; }
.plan li { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; counter-increment: p; }
.plan li:nth-child(odd) { background: var(--bg-2); }
.pl-b { flex: 1; min-width: 0; }
.pl-t { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pl-s { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
.pl-in { display: flex; gap: 3px; flex-wrap: wrap; justify-content: flex-end; max-width: 45%; }
</style>
