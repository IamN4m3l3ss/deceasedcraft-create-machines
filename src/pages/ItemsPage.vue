<script setup lang="ts">
import { computed, ref } from 'vue'
import { ITEMS } from '../data/items'
import { BY_OUT } from '../data/recipes'
import { station } from '../data/stations'
import ItemIcon from '../components/ItemIcon.vue'
import { openItem } from '../lib/store'
import { DESC } from '../data/descs'

const q = ref('')
const mod = ref('all')
const kind = ref<'all' | 'raw' | 'crafted'>('all')
const all = computed(() => Object.values(ITEMS).sort((a, b) => a.name.localeCompare(b.name)))
const mods = computed(() => [...new Set(all.value.map((i) => i.mod))].sort())
const list = computed(() => {
  const s = q.value.trim().toLowerCase()
  return all.value.filter((i) =>
    (mod.value === 'all' || i.mod === mod.value) &&
    (kind.value === 'all' || (kind.value === 'raw' ? !!i.raw : !!BY_OUT[i.id])) &&
    (!s || i.name.toLowerCase().includes(s) || i.id.includes(s) || (DESC[i.id] || '').toLowerCase().includes(s)))
})
function made(id: string) { const r = (BY_OUT[id] || []).find((x) => !x.alt) || (BY_OUT[id] || [])[0]; return r ? station(r.station).name : null }
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="big-icon"><ItemIcon id="minecraft:crafting_table" :size="40" /></div>
      <div>
        <div class="eyebrow">Reference</div>
        <h1>Items &amp; recipes</h1>
        <p>Every item these builds touch, with its recipe as it is in this pack and the station that makes it. Click an item for the full recipe, alternatives and what it’s used in.</p>
      </div>
    </div>
    <div class="filters card">
      <input v-model="q" class="search" type="search" placeholder="Search items…" aria-label="Search items" />
      <div class="seg" role="group" aria-label="Kind">
        <button type="button" :aria-pressed="kind === 'all'" @click="kind = 'all'">All</button>
        <button type="button" :aria-pressed="kind === 'crafted'" @click="kind = 'crafted'">Crafted</button>
        <button type="button" :aria-pressed="kind === 'raw'" @click="kind = 'raw'">Raw</button>
      </div>
      <select v-model="mod" class="sel" aria-label="Mod">
        <option value="all">All mods</option>
        <option v-for="m in mods" :key="m" :value="m">{{ m }}</option>
      </select>
      <span class="muted small">{{ list.length }} items</span>
    </div>
    <div class="igrid">
      <button v-for="i in list" :key="i.id" type="button" class="ic card" :title="DESC[i.id] || i.name" @click="openItem(i.id)">
        <span class="slotbg"><ItemIcon :id="i.id" :size="32" /></span>
        <span class="tx">
          <b>{{ i.name }}</b>
          <small>{{ i.mod }}</small>
          <small class="how" v-if="made(i.id)">{{ made(i.id) }}</small>
          <small class="how raw" v-else-if="i.raw">Raw resource</small>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.filters { display: flex; align-items: center; gap: 12px; padding: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.search { flex: 1; min-width: 200px; height: 38px; border-radius: 9px; border: 1px solid var(--border-2); background: var(--bg-2); color: var(--text); padding: 0 12px; font: inherit; }
.search:focus { outline: 2px solid var(--accent); outline-offset: 0; }
.sel { height: 38px; border-radius: 9px; border: 1px solid var(--border-2); background: var(--bg-2); color: var(--text); padding: 0 10px; font: inherit; }
.igrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
.ic { display: flex; align-items: center; gap: 12px; padding: 10px 12px; text-align: left; cursor: pointer; transition: border-color 0.15s; }
.ic:hover { border-color: var(--accent); }
.slotbg { width: 46px; height: 46px; border-radius: 8px; background: var(--slot); display: grid; place-items: center; flex: none; box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.45); }
.tx { min-width: 0; display: flex; flex-direction: column; }
.tx b { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx small { font-size: 12px; color: var(--muted); }
.how { color: var(--accent-2) !important; }
.how.raw { color: var(--green) !important; }
</style>
