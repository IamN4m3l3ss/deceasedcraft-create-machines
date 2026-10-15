<script setup lang="ts">
import type { Build } from '../data/builds'
import ItemIcon from './ItemIcon.vue'
defineProps<{ build: Build }>()
</script>

<template>
  <RouterLink :to="'/build/' + build.id" class="bc card">
    <div class="ic"><ItemIcon :id="build.icon" :size="32" /></div>
    <div class="grow">
      <div class="row" style="gap: 8px">
        <h3>{{ build.title }}</h3>
        <span v-if="build.tier" class="chip" :class="build.tier.toLowerCase()">{{ build.tier }}</span>
      </div>
      <div class="tl">{{ build.tagline }}</div>
    </div>
    <div class="st">
      <div class="v">{{ build.stats[0].value }}</div>
      <div class="l">{{ build.stats[0].label }}</div>
    </div>
  </RouterLink>
</template>

<style scoped>
.bc { display: flex; align-items: center; gap: 14px; padding: 14px 16px; color: inherit; text-decoration: none; transition: border-color 0.15s, transform 0.15s; }
.bc:hover { border-color: var(--accent); text-decoration: none; transform: translateY(-1px); }
.ic { width: 48px; height: 48px; border-radius: 10px; background: var(--slot); display: grid; place-items: center; flex: none; box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.45); }
h3 { font-size: 15px; }
.tl { font-size: 13px; color: var(--muted); margin-top: 2px; }
.st { text-align: right; }
.st .v { font: 700 15px var(--mono); color: var(--text); white-space: nowrap; }
.st .l { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
@media (max-width: 520px) { .st { display: none; } }
</style>
