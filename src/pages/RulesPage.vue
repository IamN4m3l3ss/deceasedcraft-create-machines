<script setup lang="ts">
import ItemIcon from '../components/ItemIcon.vue'
import ItemSlot from '../components/ItemSlot.vue'
const rules = [
  { icon: 'immersiveengineering:component_electronic', title: 'Deployers cost an IE Electronic Component', body: 'The pack swaps Create’s Electron Tube for IE’s Electronic Component in every recipe, so deployers, brass funnels, mechanical crafters and arms cost more than usual. The cheapest way to make the component is the IE Engineer’s Workbench with the components blueprint: treated wood slab, quartz, redstone and electrum wire.', items: ['create:deployer', 'create:brass_funnel', 'create:mechanical_crafter', 'create:mechanical_arm'] },
  { icon: 'create:deployer', title: 'An empty deployer stops the belt', body: 'Items wait forever under a deployer with nothing in its hand. Keep every station stocked, or put a lever on it to switch it off.' },
  { icon: 'create:water_wheel', title: 'Small water wheels make 128 SU', body: 'The pack’s config cuts the small wheel in half. The large wheel still makes 512 SU.' },
  { icon: 'fluid:water', title: 'You don’t need a lake', body: 'A pump pulling from a 2×2 water pool never empties it: vanilla refills the source block straight away, and Create counts that as endless water.' },
  { icon: 'create:blaze_burner', title: 'Burners take fuel by hand only', body: 'Blaze burners don’t accept fuel from funnels, hoppers or chutes. Feed them yourself, or use a deployer or a Mechanical Arm.' },
  { icon: 'createdieselgenerators:huge_diesel_engine', title: 'Diesel engines are sequenced assembly', body: 'Engine pistons and all three engine sizes are pack sequenced-assembly recipes with aluminum blocks, steel, precision mechanisms and redstone acid. A huge engine is 9 runs: normal → modular → huge.', items: ['createdieselgenerators:engine_piston', 'createdieselgenerators:diesel_engine', 'createdieselgenerators:large_diesel_engine', 'createdieselgenerators:huge_diesel_engine'] },
  { icon: 'createaddition:alternator', title: 'Alternators and motors need Mechanical Crafters', body: 'Both are 5×5 pack recipes on 13 crafters in a diamond, with copper spools, a capacitor and an iron rod.' },
  { icon: 'bigreactors:reinforced_reactorcasing', title: 'Only the reinforced reactor exists', body: 'The basic reactor parts can’t be crafted. Every reinforced casing needs a Refined Storage machine casing (aluminum and duroplast plates), and the controller needs an RS Controller and advanced processors.', items: ['refinedstorage:machine_casing', 'refinedstorage:controller', 'refinedstorage:advanced_processor'] },
  { icon: 'fluid:redstone_acid', title: 'Redstone acid from a heated mixer', body: 'The pack adds a heated-mixer recipe: 1 redstone → 250 mB redstone acid. You need it for diesel engines, RS processors and rubber.' },
  { icon: 'immersiveengineering:ingot_steel', title: 'Steel from a superheated mixer', body: 'Besides the IE blast furnace, the pack lets a superheated mixer make steel from an iron ingot and coal coke dust (mill coal coke first).' },
]
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="big-icon"><ItemIcon id="immersiveengineering:component_electronic" :size="40" /></div>
      <div>
        <div class="eyebrow">Reference</div>
        <h1>Pack rules that change things</h1>
        <p>Where DeceasedCraft’s scripts and configs differ from plain Create, and what that means for the builds.</p>
      </div>
    </div>
    <div class="grid-2">
      <article v-for="r in rules" :key="r.title" class="card rule">
        <div class="card-b">
          <div class="row" style="gap: 12px; align-items: flex-start">
            <span class="ri"><ItemIcon :id="r.icon" :size="28" /></span>
            <div class="grow">
              <h3>{{ r.title }}</h3>
              <p style="margin: 6px 0 0">{{ r.body }}</p>
              <div v-if="r.items" class="row wrap" style="gap: 6px; margin-top: 12px"><ItemSlot v-for="id in r.items" :key="id" :id="id" :size="22" /></div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.ri { width: 46px; height: 46px; border-radius: 10px; background: var(--slot); display: grid; place-items: center; flex: none; box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.45); }
</style>
