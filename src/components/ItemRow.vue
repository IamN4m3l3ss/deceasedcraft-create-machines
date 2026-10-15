<script setup lang="ts">
import { computed } from 'vue'
import ItemSlot from './ItemSlot.vue'
import { item } from '../data/items'
import { openItem } from '../lib/store'
import { qty, stacks } from '../lib/format'

const props = defineProps<{ id: string; n: number }>()
const it = computed(() => item(props.id))
</script>

<template>
  <li class="ir">
    <ItemSlot :id="id" :size="28" :n="undefined" />
    <button type="button" class="nm" @click="openItem(id)">
      <span class="t">{{ it.name }}</span>
      <span class="m">{{ it.mod }}</span>
    </button>
    <span class="q">
      <span class="v">{{ qty(id, n) }}</span>
      <span class="s" v-if="stacks(id, n)">{{ stacks(id, n) }}</span>
    </span>
  </li>
</template>

<style scoped>
.ir { display: flex; align-items: center; gap: 12px; padding: 6px 8px; border-radius: 8px; }
.ir:hover { background: var(--surface-2); }
.nm { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; }
.nm .t { color: var(--text); font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.nm:hover .t { color: var(--accent-2); }
.nm .m { color: var(--muted); font-size: 12px; }
.q { display: flex; flex-direction: column; align-items: flex-end; }
.q .v { font: 600 15px var(--mono); color: var(--text); }
.q .s { font-size: 11px; color: var(--muted); }
</style>
