<script setup lang="ts">
import { STAGES } from '../data/progression'
import { BUILD } from '../data/builds'
import ItemIcon from '../components/ItemIcon.vue'
import ItemSlot from '../components/ItemSlot.vue'

function link(b: { id: string; v?: string }) { return { path: '/build/' + b.id, query: b.v ? { v: b.v } : {} } }
function label(b: { id: string; v?: string }) {
  const B = BUILD[b.id]
  const v = b.v && B.variants ? B.variants.find((x) => x.id === b.v) : null
  return B.title + (v ? ' · ' + v.label : B.variants ? ' · ' + (B.mainLabel || 'main') : '')
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="big-icon"><ItemIcon id="minecraft:paper" :size="40" /></div>
      <div>
        <span class="eyebrow">Following the questbook</span>
        <h1>What to build when</h1>
        <p>The pack’s questbook walks you through Steels, Power Generation, Refined Storage, Bullet Automation and Guns. This page puts the builds on this site in that order, with the other mods’ machines you need along the way. Where a build has a smaller version, start with that one.</p>
      </div>
    </div>

    <ol class="stages">
      <li v-for="s in STAGES" :key="s.n" class="stage">
        <div class="rail"><span class="num" :class="s.tier.toLowerCase()">{{ s.n }}</span></div>
        <section class="card body">
          <header class="card-h">
            <div class="grow">
              <div class="row wrap" style="gap: 8px"><span class="chip" :class="s.tier.toLowerCase()">{{ s.tier }} game</span><span class="eyebrow">Quest chapter: {{ s.chapter }}</span></div>
              <h2>{{ s.title }}</h2>
            </div>
          </header>
          <div class="card-b">
            <p>{{ s.goal }}</p>
            <div class="quest">
              <span class="eyebrow">The questbook asks for</span>
              <div class="row wrap" style="gap: 6px"><ItemSlot v-for="id in s.quest" :key="id" :id="id" :size="24" /></div>
            </div>
            <div v-if="s.builds.length" class="blist">
              <RouterLink v-for="b in s.builds" :key="b.id + (b.v || '')" :to="link(b)" class="bl">
                <ItemIcon :id="BUILD[b.id].icon" :size="26" />
                <span class="bt"><b>{{ label(b) }}</b><span>{{ b.why }}</span></span>
                <span class="go">→</span>
              </RouterLink>
            </div>
            <div v-if="s.other.length" class="other">
              <span class="eyebrow">Also needed (other mods)</span>
              <div v-for="o in s.other" :key="o.name" class="oi">
                <ItemIcon :id="o.icon" :size="22" />
                <span><b>{{ o.name }}</b> · {{ o.note }}</span>
              </div>
            </div>
            <p v-if="s.tip" class="small tip">{{ s.tip }}</p>
          </div>
        </section>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.stages { list-style: none; margin: 20px 0 0; padding: 0; }
.stage { display: grid; grid-template-columns: 44px 1fr; gap: 12px; }
.stage + .stage { margin-top: 14px; }
.rail { position: relative; display: flex; justify-content: center; }
.rail::before { content: ''; position: absolute; top: 0; bottom: -14px; width: 2px; background: var(--border); }
.stage:last-child .rail::before { bottom: 50%; }
.num { position: relative; margin-top: 16px; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font: 700 15px var(--mono); background: var(--surface-2); border: 2px solid var(--border-2); }
.num.early { border-color: var(--early); color: var(--early); }
.num.mid { border-color: var(--mid); color: var(--mid); }
.num.late { border-color: var(--late); color: var(--late); }
.body h2 { margin-top: 4px; }
.quest { margin: 4px 0 14px; display: flex; flex-direction: column; gap: 6px; }
.blist { display: flex; flex-direction: column; gap: 8px; }
.bl { display: flex; align-items: center; gap: 12px; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--border-2); background: var(--surface-2); color: var(--text); text-decoration: none; }
.bl:hover { border-color: var(--accent); text-decoration: none; }
.bt { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.bt span { font-size: 13px; color: var(--text-2); }
.go { color: var(--accent); }
.other { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.oi { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-2); }
.tip { margin: 12px 0 0; padding: 8px 10px; border-radius: 8px; background: var(--accent-soft); }
@media (max-width: 600px) { .stage { grid-template-columns: 30px 1fr; gap: 8px; } .num { width: 28px; height: 28px; font-size: 13px; } }
</style>
