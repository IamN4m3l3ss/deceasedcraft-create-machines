<script setup lang="ts">
import { computed } from 'vue'
import { BUILDS } from '../data/builds'
import { SECTIONS } from '../data/sections'
import BuildCard from '../components/BuildCard.vue'
import DataTable from '../components/DataTable.vue'
import Callout from '../components/Callout.vue'
import ItemSlot from '../components/ItemSlot.vue'
import ItemIcon from '../components/ItemIcon.vue'

const props = defineProps<{ section: 'production' | 'kinetic' | 'electric' }>()
const S = computed(() => SECTIONS[props.section])
const builds = computed(() => BUILDS.filter((b) => b.section === props.section))
</script>

<template>
  <div class="page" :key="section">
    <div class="page-head">
      <div class="big-icon"><ItemIcon :id="S.icon" :size="40" /></div>
      <div>
        <div class="eyebrow">{{ S.eyebrow }}</div>
        <h1>{{ S.title }}</h1>
        <p>{{ S.intro }}</p>
      </div>
    </div>

    <div v-if="S.tiers" class="grid-3 tiers">
      <article v-for="t in S.tiers" :key="t.tier" class="card tier">
        <div class="card-b">
          <div class="row" style="justify-content: space-between">
            <span class="chip" :class="t.tier.toLowerCase()">{{ t.tier }} game</span>
            <ItemIcon :id="t.icon" :size="24" />
          </div>
          <h3 style="margin-top: 12px">{{ t.title }}</h3>
          <div class="big">{{ t.value }}</div>
          <ul class="pts"><li v-for="p in t.points" :key="p" v-html="p" /></ul>
          <RouterLink v-for="l in t.links" :key="l.to" :to="l.to" class="btn sm" style="margin: 4px 6px 0 0">{{ l.label }} →</RouterLink>
        </div>
      </article>
    </div>

    <div v-if="S.flows" class="grid-2" style="margin-top: 4px">
      <section v-for="f in S.flows" :key="f.title" class="card">
        <header class="card-h"><h3>{{ f.title }}</h3></header>
        <div class="card-b">
          <div v-for="(row, i) in f.rows" :key="i" class="flow">
            <div class="row" style="gap: 4px"><ItemSlot v-for="id in row.from" :key="id" :id="id" :size="22" /></div>
            <span class="via">{{ row.via }}</span>
            <ItemSlot :id="row.to" :size="22" />
            <span class="muted small">{{ row.label }}</span>
          </div>
          <p class="small" style="margin: 10px 0 0">{{ f.note }}</p>
        </div>
      </section>
    </div>

    <h2 style="margin: 28px 0 12px">The builds</h2>
    <div class="grid-2"><BuildCard v-for="b in builds" :key="b.id" :build="b" /></div>

    <div class="stack" style="margin-top: 28px">
      <Callout v-for="c in S.callouts || []" :key="c.title" :title="c.title" :tone="c.tone">{{ c.body }}</Callout>
      <section v-for="(t, i) in S.tables || []" :key="i" class="card"><div class="card-b"><DataTable :table="t" /></div></section>
    </div>
  </div>
</template>

<style scoped>
.tier .big { font: 800 26px/1.2 var(--font); margin: 6px 0 10px; color: var(--text); letter-spacing: -0.02em; }
.pts { margin: 0 0 10px; padding-left: 18px; color: var(--text-2); font-size: 14px; }
.pts li { margin-bottom: 6px; }
.flow { display: flex; align-items: center; gap: 10px; padding: 6px 0; flex-wrap: wrap; }
.via { font-size: 12px; color: var(--accent-2); background: var(--accent-soft); padding: 2px 8px; border-radius: 6px; white-space: nowrap; }
</style>
