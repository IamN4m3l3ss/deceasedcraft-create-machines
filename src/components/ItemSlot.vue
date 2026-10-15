<script setup lang="ts">
import { computed } from 'vue'
import ItemIcon from './ItemIcon.vue'
import { item } from '../data/items'
import { openItem } from '../lib/store'
import { slotCount, qty } from '../lib/format'

const props = withDefaults(defineProps<{ id?: string; n?: number; size?: number; plain?: boolean; kept?: boolean }>(), { size: 32 })
const it = computed(() => (props.id ? item(props.id) : null))
const label = computed(() => (it.value ? `${it.value.name}${props.n ? ' × ' + qty(it.value.id, props.n) : ''}` : 'Empty'))
</script>

<template>
  <button v-if="it" type="button" class="slot" :class="{ plain, kept }" :style="{ '--s': size + 'px' }" :title="label" :aria-label="label" @click="openItem(it.id)">
    <ItemIcon :id="it.id" :size="size" />
    <span v-if="n && (n > 1 || it.fluid)" class="cnt">{{ slotCount(it.id, n) }}</span>
    <span v-if="kept" class="kept-b" title="Not used up">∞</span>
  </button>
  <span v-else class="slot empty" :style="{ '--s': size + 'px' }" />
</template>

<style scoped>
.slot {
  position: relative; display: inline-grid; place-items: center; flex: none;
  width: calc(var(--s) + 12px); height: calc(var(--s) + 12px);
  background: var(--slot); border: 1px solid #000; border-radius: 6px;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.45), inset -1px -1px 0 rgba(255, 255, 255, 0.06);
  padding: 0; cursor: pointer; transition: transform 0.08s, box-shadow 0.15s;
}
.slot:hover { box-shadow: inset 0 0 0 2px var(--accent), inset 2px 2px 0 rgba(0, 0, 0, 0.45); }
.slot.empty { cursor: default; opacity: 0.55; }
.slot.empty:hover { box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.45), inset -1px -1px 0 rgba(255, 255, 255, 0.06); }
.slot.plain { background: transparent; border-color: transparent; box-shadow: none; }
.cnt {
  position: absolute; right: 2px; bottom: 0; font: 700 12px/1 var(--mono); color: #fff;
  text-shadow: 1px 1px 0 #3a3a3a, -1px 0 0 #000, 0 1px 0 #000; pointer-events: none;
}
.kept-b { position: absolute; left: 2px; top: 1px; font: 700 11px/1 var(--mono); color: var(--accent-2); }
</style>
