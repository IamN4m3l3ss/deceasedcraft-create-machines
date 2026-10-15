<script setup lang="ts">
import { computed } from 'vue'
import { item, texPath } from '../data/items'
import { iconUrl } from '../lib/icons'
import { store } from '../lib/store'

const props = withDefaults(defineProps<{ id: string; size?: number }>(), { size: 32 })
const it = computed(() => item(props.id))
const src = computed(() => {
  const p = texPath(it.value)
  if (p && store.icons.has(p.slice(6, -4))) return p
  return iconUrl(it.value.icon)
})
</script>

<template>
  <img class="px" :src="src" :width="size" :height="size" :alt="it.name" draggable="false" style="object-fit: cover; object-position: top" />
</template>
