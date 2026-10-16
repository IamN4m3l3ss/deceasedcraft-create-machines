<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BUILD, withVariant } from '../data/builds'
import { LINES, lineLoad } from '../data/lines'
import LinePicker from '../components/LinePicker.vue'
import ItemIcon from '../components/ItemIcon.vue'
import ItemSlot from '../components/ItemSlot.vue'
import StatTiles from '../components/StatTiles.vue'
import BuildViewer from '../components/BuildViewer.vue'
import BomPanel from '../components/BomPanel.vue'
import DataTable from '../components/DataTable.vue'
import Callout from '../components/Callout.vue'

const props = defineProps<{ id: string }>()
const route = useRoute(), router = useRouter()
const base = computed(() => BUILD[props.id] || BUILD.ammo)
const variant = computed(() => { const v = String(route.query.v || ''); return base.value.variants?.some((x) => x.id === v) ? v : 'main' })
const b = computed(() => withVariant(base.value, variant.value))
const versions = computed(() => base.value.variants ? [{ id: 'main', label: base.value.mainLabel || 'Main', blurb: base.value.mainBlurb || '' }, ...base.value.variants.map((v) => ({ id: v.id, label: v.label, blurb: v.blurb }))] : [])
const line = computed(() => LINES[base.value.id] || null)
const mode = computed(() => { const m = String(route.query.m || ''); return line.value && line.value.modes.some((x) => x.id === m) ? m : line.value?.defaultMode || '' })
const load = computed(() => (line.value ? lineLoad(line.value, mode.value) : null))
const stations = computed(() => {
  const g = b.value.grid; if (!g) return []
  const out: string[] = []
  for (const L of g.layers) for (const r of L.rows) for (const t of r.split(' ')) if (/^([DS]\d|P\d|X)$/.test(t) && !out.includes(t)) out.push(t)
  return out.sort()
})
function setQuery(q: Record<string, string>) { router.replace({ query: { ...route.query, ...q } }) }
function pickMode(id: string) { setQuery({ m: id }) }
function pickVariant(id: string) { setQuery({ v: id === 'main' ? '' : id }) }
const sectionName = computed(() => ({ production: 'Production', kinetic: 'Rotational power', electric: 'Electricity' })[b.value.section])
const sectionLink = computed(() => ({ production: '/production', kinetic: '/power', electric: '/electricity' })[b.value.section])
</script>

<template>
  <div class="page" :key="b.id">
    <div class="page-head">
      <div class="big-icon"><ItemIcon :id="b.icon" :size="40" /></div>
      <div>
        <div class="row wrap" style="gap: 8px">
          <RouterLink :to="sectionLink" class="eyebrow">{{ sectionName }}</RouterLink>
          <span v-if="b.tier" class="chip" :class="b.tier.toLowerCase()">{{ b.tier }} game</span>
        </div>
        <h1>{{ b.title }}</h1>
        <p>{{ b.intro }}</p>
      </div>
    </div>

    <section class="io card">
      <div class="io-side">
        <span class="eyebrow">Put in</span>
        <div class="row wrap" style="gap: 6px">
          <ItemSlot v-for="id in b.io.in" :key="id" :id="id" :size="28" />
          <span v-if="b.io.inText" class="io-t">{{ b.io.inText }}</span>
        </div>
      </div>
      <span class="io-arrow" aria-hidden="true">→</span>
      <div class="io-side">
        <span class="eyebrow">Get out</span>
        <div class="row wrap" style="gap: 6px">
          <ItemSlot v-for="id in b.io.out" :key="id" :id="id" :size="28" />
          <span v-if="b.io.outText" class="io-t" :class="{ big: !b.io.out.length }">{{ b.io.outText }}</span>
        </div>
      </div>
    </section>

    <StatTiles :stats="b.stats" style="margin-top: 12px" />

    <div v-if="versions.length" class="versions card">
      <span class="eyebrow">Version</span>
      <div class="vlist">
        <button v-for="v in versions" :key="v.id" type="button" class="ver" :aria-pressed="v.id === variant" @click="pickVariant(v.id)">
          <b>{{ v.label }}</b><span>{{ v.blurb }}</span>
        </button>
      </div>
    </div>

    <div style="margin-top: 20px"><BuildViewer :build="b" :load="load" /></div>

    <div v-if="line" style="margin-top: 20px">
      <LinePicker :line="line" :mode="mode" :stations="stations" :variant="variant" :variants="versions" @mode="pickMode" @variant="pickVariant" />
    </div>

    <div class="split" style="margin-top: 20px">
      <div class="stack">
        <section class="card">
          <header class="card-h"><h2>How to build it</h2></header>
          <div class="card-b"><ol class="steps"><li v-for="(s, i) in b.steps" :key="i" v-html="s" /></ol></div>
        </section>
        <Callout v-for="c in b.callouts || []" :key="c.title" :title="c.title" :tone="c.tone">{{ c.body }}</Callout>
        <section v-if="b.tables?.length" class="card">
          <div class="card-b stack"><DataTable v-for="(t, i) in b.tables" :key="i" :table="t" /></div>
        </section>
      </div>
      <div class="stack">
        <BomPanel :groups="b.parts" :title="'What you need'" />
        <section v-if="b.stock" class="card">
          <header class="card-h"><h3>Keep stocked</h3></header>
          <div class="card-b">
            <div class="row wrap" style="gap: 6px; margin-bottom: 10px"><ItemSlot v-for="[id, q] in b.stock.items" :key="id" :id="id" :n="q" /></div>
            <p class="small" style="margin: 0">{{ b.stock.note }}</p>
          </div>
        </section>
        <section v-if="b.running" class="card">
          <header class="card-h"><h3>Running cost</h3></header>
          <div class="card-b"><p style="margin: 0">{{ b.running }}</p></div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.io { display: flex; align-items: center; gap: 18px; padding: 14px 18px; flex-wrap: wrap; }
.io-side { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.io-arrow { font-size: 26px; color: var(--accent); }
.io-t { font-size: 13px; color: var(--text-2); }
.io-t.big { font: 700 20px var(--font); color: var(--green); }
.versions { margin-top: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.vlist { display: flex; gap: 8px; flex-wrap: wrap; }
.ver { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; padding: 7px 12px; border-radius: 9px; border: 1px solid var(--border-2); background: var(--surface-2); cursor: pointer; text-align: left; }
.ver span { font-size: 12px; color: var(--muted); }
.ver:hover { border-color: var(--accent); }
.ver[aria-pressed='true'] { background: var(--accent-soft); border-color: var(--accent); }
.ver[aria-pressed='true'] b { color: var(--accent-2); }
</style>
