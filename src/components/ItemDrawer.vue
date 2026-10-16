<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch, ref, nextTick } from 'vue'
import { store, closeItem } from '../lib/store'
import { item } from '../data/items'
import { BY_OUT, USED_IN } from '../data/recipes'
import { BUILDS } from '../data/builds'
import { DESC } from '../data/descs'
import ItemIcon from './ItemIcon.vue'
import ItemSlot from './ItemSlot.vue'
import RecipeCard from './RecipeCard.vue'

const it = computed(() => (store.drawer ? item(store.drawer) : null))
const recipes = computed(() => (store.drawer ? [...(BY_OUT[store.drawer] || [])].sort((a, b) => Number(!!a.alt) - Number(!!b.alt)) : []))
const usedIn = computed(() => {
  if (!store.drawer) return []
  const outs = new Set<string>()
  for (const r of USED_IN[store.drawer] || []) outs.add(r.out)
  return [...outs]
})
const inBuilds = computed(() => (store.drawer ? BUILDS.filter((b) => b.parts.some((g) => g.items.some(([id]) => id === store.drawer))) : []))
const panel = ref<HTMLElement | null>(null)
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeItem() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
watch(() => store.drawer, async (v) => { if (v) { await nextTick(); panel.value?.scrollTo({ top: 0 }); panel.value?.focus() } })
</script>

<template>
  <Transition name="fade"><div v-if="it" class="scrim" @click="closeItem()" /></Transition>
  <Transition name="slide">
    <aside v-if="it" ref="panel" class="drawer" tabindex="-1" role="dialog" :aria-label="it.name">
      <header class="dh">
        <div class="big"><ItemIcon :id="it.id" :size="40" /></div>
        <div class="grow">
          <div class="eyebrow">{{ it.mod }}</div>
          <h2>{{ it.name }}</h2>
          <code class="muted small">{{ it.id.startsWith('fluid:') ? 'fluid · counted in mB (1,000 mB = 1 bucket)' : it.id }}</code>
          <p v-if="DESC[it.id]" class="desc">{{ DESC[it.id] }}</p>
        </div>
        <button class="btn ghost sm" type="button" aria-label="Close" @click="closeItem()">✕</button>
      </header>
      <div class="db">
        <div v-if="it.source" class="callout ok">
          <span class="ic">✓</span>
          <div><h4>Raw resource</h4><p>{{ it.source }}</p></div>
        </div>
        <section v-if="recipes.length">
          <h3 class="sec">How to make it</h3>
          <div class="stack-s">
            <RecipeCard v-for="r in recipes" :key="r.id" :recipe="r" />
          </div>
        </section>
        <p v-else-if="!it.source" class="muted">No recipe listed here. Check JEI in game.</p>
        <section v-if="usedIn.length">
          <h3 class="sec">Used to make</h3>
          <div class="row wrap gap-s">
            <ItemSlot v-for="o in usedIn" :key="o" :id="o" :size="28" />
          </div>
        </section>
        <section v-if="inBuilds.length">
          <h3 class="sec">Part of these builds</h3>
          <div class="row wrap gap-s">
            <RouterLink v-for="b in inBuilds" :key="b.id" class="chip accent" :to="'/build/' + b.id" @click="closeItem()">{{ b.title }}</RouterLink>
          </div>
        </section>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; background: rgba(5, 6, 8, 0.55); z-index: 60; backdrop-filter: blur(2px); }
.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(520px, 100vw); z-index: 61;
  background: var(--surface); border-left: 1px solid var(--border); overflow-y: auto; outline: none;
  box-shadow: -20px 0 40px rgba(0, 0, 0, 0.35);
}
.dh { display: flex; gap: 14px; align-items: flex-start; padding: 20px 20px 16px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 1; }
.dh h2 { margin: 2px 0 2px; font-size: 20px; }
.desc { margin: 8px 0 0; font-size: 14px; color: var(--text-2); }
.big { width: 56px; height: 56px; border-radius: 12px; background: var(--slot); display: grid; place-items: center; flex: none; box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.45); }
.db { padding: 18px 20px 40px; display: flex; flex-direction: column; gap: 22px; }
.sec { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 10px; }
.stack-s { display: flex; flex-direction: column; gap: 10px; }
.gap-s { gap: 6px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
