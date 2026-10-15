<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed, shallowRef } from 'vue'
import type { Build } from '../data/builds'
import LayerGrid from './LayerGrid.vue'
import { createViewer } from '../three/viewer.js'

const props = defineProps<{ build: Build }>()
const host = ref<HTMLElement | null>(null)
const viewer = shallowRef<any>(null)
const failed = ref(false)
const layer = ref(-1)
const grid = computed(() => props.build.grid)
const shownLayer = computed(() => (grid.value ? grid.value.layers[layer.value < 0 ? 0 : layer.value] : null))

function show() {
  const v = viewer.value
  if (!v || v.dead) return
  v.show(props.build.scene, grid.value)
  v.setLayer(layer.value < 0 || !grid.value ? null : grid.value.layers[layer.value].y)
}
function setLayer(i: number) { layer.value = i; show() }

onMounted(() => {
  if (!host.value) return
  const v = createViewer(host.value)
  if (v.dead) { failed.value = true; return }
  viewer.value = v
  show()
})
onBeforeUnmount(() => { viewer.value?.dispose?.() })
watch(() => props.build.id, () => { layer.value = -1; show() })
</script>

<template>
  <section class="card bv">
    <div ref="host" class="stage">
      <div v-if="failed" class="fallback">The 3D view needs WebGL, which this browser has turned off. The steps and lists on this page describe the same build.</div>
      <div class="tools" v-if="!failed">
        <button class="btn sm" type="button" @click="viewer?.reset()">Reset view</button>
      </div>
      <div class="hint" v-if="!failed">Drag to rotate · scroll to zoom · right-drag to pan</div>
    </div>
    <div v-if="grid" class="layers">
      <div class="row wrap" style="gap: 10px">
        <span class="eyebrow">Layer</span>
        <div class="seg" role="group" aria-label="Layer">
          <button type="button" :aria-pressed="layer === -1" @click="setLayer(-1)">Whole build</button>
          <button v-for="(L, i) in grid.layers" :key="L.y" type="button" :aria-pressed="layer === i" @click="setLayer(i)">{{ L.name }}</button>
        </div>
      </div>
      <p class="cap">{{ layer < 0 ? 'The 3D view shows the whole build; the grid shows the bottom layer. Pick a layer to cut the 3D view down to it.' : grid.layers[layer].cap }}</p>
      <LayerGrid v-if="shownLayer" :layer="shownLayer" :zs="grid.zs" />
    </div>
  </section>
</template>

<style scoped>
.bv { overflow: hidden; }
.stage {
  position: relative; height: clamp(320px, 52vh, 560px);
  background: radial-gradient(120% 90% at 50% 0%, #2a3039 0%, #1a1e24 55%, #14171b 100%);
}
.stage :deep(canvas) { display: block; width: 100%; height: 100%; cursor: grab; }
.stage :deep(canvas:active) { cursor: grabbing; }
.tools { position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; }
.hint { position: absolute; left: 14px; bottom: 10px; font-size: 12px; color: var(--muted); pointer-events: none; }
.fallback { position: absolute; inset: 0; display: grid; place-items: center; padding: 24px; text-align: center; color: var(--muted); }
.layers { padding: 14px 18px 18px; border-top: 1px solid var(--border); }
.cap { margin: 10px 0 12px; font-size: 14px; }
@media (max-width: 700px) { .hint { display: none; } }
</style>
