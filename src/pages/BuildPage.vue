<script setup lang="ts">
import { computed } from 'vue'
import { BUILD } from '../data/builds'
import ItemIcon from '../components/ItemIcon.vue'
import ItemSlot from '../components/ItemSlot.vue'
import StatTiles from '../components/StatTiles.vue'
import BuildViewer from '../components/BuildViewer.vue'
import BomPanel from '../components/BomPanel.vue'
import DataTable from '../components/DataTable.vue'
import Callout from '../components/Callout.vue'

const props = defineProps<{ id: string }>()
const b = computed(() => BUILD[props.id] || BUILD.ammo)
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

    <StatTiles :stats="b.stats" />

    <div style="margin-top: 20px"><BuildViewer :build="b" /></div>

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
