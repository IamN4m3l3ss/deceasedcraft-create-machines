<script setup lang="ts">
import type { Stat } from '../data/builds'
defineProps<{ stats: Stat[] }>()
</script>

<template>
  <div class="tiles">
    <div v-for="s in stats" :key="s.label" class="tile">
      <div class="l">{{ s.label }}</div>
      <div class="v">{{ s.value }}</div>
      <div v-if="s.hint" class="h">{{ s.hint }}</div>
    </div>
  </div>
</template>

<style scoped>
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.tile { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; }
.l { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.v { font: 700 22px/1.3 var(--font); color: var(--text); margin-top: 4px; letter-spacing: -0.01em; }
.h { font-size: 12.5px; color: var(--muted); }
</style>
