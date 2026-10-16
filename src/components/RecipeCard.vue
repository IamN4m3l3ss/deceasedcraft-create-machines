<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '../data/recipes'
import { station } from '../data/stations'
import { item } from '../data/items'
import ItemSlot from './ItemSlot.vue'
import ItemIcon from './ItemIcon.vue'
import { num } from '../lib/format'

const props = defineProps<{ recipe: Recipe; compact?: boolean }>()
const st = computed(() => station(props.recipe.station))
const cells = computed(() => {
  const g = props.recipe.grid
  if (!g) return null
  const w = Math.max(...g.pattern.map((r) => r.length))
  return { w, rows: g.pattern.map((r) => Array.from({ length: w }, (_, i) => (r[i] && r[i] !== ' ' ? g.key[r[i]] : undefined))) }
})
const outN = computed(() => props.recipe.n)
const outLabel = computed(() => {
  const n = props.recipe.n
  if (item(props.recipe.out).fluid) return `${num(n)} mB`
  return Number.isInteger(n) ? (n > 1 ? `× ${n}` : '') : `${Math.round(n * 100)}% chance`
})
const stepText: Record<string, string> = { deploy: 'Add', press: 'Press', cut: 'Cut', fill: 'Pour' }
const hasKept = computed(() => !!props.recipe.steps?.some((s) => s.kept))
</script>

<template>
  <div class="rc">
    <div class="rc-h">
      <span class="st"><ItemIcon :id="st.icon" :size="16" /> {{ st.name }}</span>
      <span v-if="recipe.pack" class="chip pack" title="Changed or added by the DeceasedCraft scripts">Pack recipe</span>
      <span v-if="recipe.alt" class="chip">Alternative</span>
    </div>
    <p v-if="st.how && !compact" class="how">{{ st.how }}</p>
    <div class="rc-b">
      <!-- shaped crafting / mechanical crafting -->
      <template v-if="cells">
        <div class="cgrid" :style="{ gridTemplateColumns: `repeat(${cells.w}, auto)` }">
          <template v-for="(row, ri) in cells.rows" :key="ri">
            <ItemSlot v-for="(id, ci) in row" :key="ri + '-' + ci" :id="id" :size="24" />
          </template>
        </div>
        <span class="arrow">→</span>
        <div class="out"><ItemSlot :id="recipe.out" :n="outN" :size="32" /><span v-if="outLabel" class="ol">{{ outLabel }}</span></div>
      </template>
      <!-- sequenced assembly -->
      <template v-else-if="recipe.steps">
        <div class="seq">
          <div class="seq-row">
            <ItemSlot :id="recipe.base" :size="24" />
            <span class="arrow">→</span>
            <ol class="seq-steps">
              <li v-for="(s, i) in recipe.steps" :key="i">
                <span class="k">{{ stepText[s.kind] }}</span>
                <ItemSlot v-if="s.item" :id="s.item" :n="s.qty" :size="20" :kept="s.kept" />
              </li>
            </ol>
          </div>
          <p v-if="hasKept" class="kept-n">∞ = stays in its deployer, not used up</p>
          <div class="seq-row">
            <span class="loops" v-if="recipe.loops && recipe.loops > 1">repeat × {{ recipe.loops }}</span>
            <span class="loops" v-else>once</span>
            <span class="arrow">→</span>
            <ItemSlot :id="recipe.out" :n="outN" :size="32" /><span v-if="outLabel" class="ol">{{ outLabel }}</span>
          </div>
        </div>
      </template>
      <!-- machine / shapeless -->
      <template v-else>
        <div class="ins">
          <template v-for="([id, q], i) in recipe.in" :key="id">
            <span v-if="i" class="plus">+</span>
            <ItemSlot :id="id" :n="q" :size="28" />
          </template>
        </div>
        <span class="arrow">→</span>
        <div class="out"><ItemSlot :id="recipe.out" :n="outN" :size="32" /><span v-if="outLabel" class="ol">{{ outLabel }}</span></div>
      </template>
    </div>
    <p v-if="recipe.note && !compact" class="note">{{ recipe.note }}</p>
  </div>
</template>

<style scoped>
.rc { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.rc-h { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--border); background: var(--bg-2); flex-wrap: wrap; }
.st { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text); flex: 1; }
.rc-b { display: flex; align-items: center; gap: 12px; padding: 14px 12px; flex-wrap: wrap; }
.cgrid { display: grid; gap: 3px; }
.arrow { color: var(--muted); font-size: 20px; line-height: 1; }
.out { display: flex; align-items: center; gap: 8px; }
.ol { font: 600 12px var(--mono); color: var(--text-2); }
.ins { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.plus { color: var(--muted); font-weight: 700; }
.seq { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.seq-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.seq-steps { list-style: none; margin: 0; padding: 0; display: flex; gap: 6px; flex-wrap: wrap; counter-reset: q; }
.seq-steps li { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px 3px 6px; border-radius: 8px; background: var(--surface-3); counter-increment: q; }
.seq-steps li::before { content: counter(q); font: 700 11px var(--mono); color: var(--muted); }
.seq-steps .k { font-size: 12px; font-weight: 600; color: var(--text-2); }
.loops { font: 600 12px var(--mono); color: var(--accent-2); background: var(--accent-soft); padding: 3px 8px; border-radius: 6px; }
.how { margin: 0; padding: 8px 12px 0; font-size: 12.5px; color: var(--muted); }
.kept-n { margin: 0; font-size: 12px; color: var(--accent-2); }
.note { margin: 0; padding: 0 12px 12px; font-size: 13px; color: var(--muted); }
</style>
