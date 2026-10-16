<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BUILDS } from './data/builds'
import ItemIcon from './components/ItemIcon.vue'
import ItemDrawer from './components/ItemDrawer.vue'
import { store, closeItem } from './lib/store'

const route = useRoute()
const groups = computed(() => [
  { label: 'Production', items: [{ to: '/production', label: 'Overview', icon: 'create:deployer' }, ...BUILDS.filter((b) => b.section === 'production').map((b) => ({ to: '/build/' + b.id, label: b.nav, icon: b.icon }))] },
  { label: 'Rotational power', items: [{ to: '/power', label: 'Overview', icon: 'create:cogwheel' }, ...BUILDS.filter((b) => b.section === 'kinetic').map((b) => ({ to: '/build/' + b.id, label: b.nav, icon: b.icon, tier: b.tier }))] },
  { label: 'Electricity', items: [{ to: '/electricity', label: 'Overview', icon: 'createaddition:capacitor' }, ...BUILDS.filter((b) => b.section === 'electric').map((b) => ({ to: '/build/' + b.id, label: b.nav, icon: b.icon, tier: b.tier }))] },
  { label: 'Reference', items: [
    { to: '/shopping', label: 'Shopping list', icon: 'minecraft:chest' },
    { to: '/items', label: 'Items & recipes', icon: 'minecraft:crafting_table' },
    { to: '/rules', label: 'Pack rules', icon: 'immersiveengineering:component_electronic' },
    { to: '/credits', label: 'Credits', icon: 'minecraft:paper' },
  ] },
])
watch(() => route.fullPath, () => { store.navOpen = false; closeItem(); window.scrollTo({ top: 0 }) })
</script>

<template>
  <div class="shell" :class="{ open: store.navOpen }">
    <header class="topbar">
      <button class="btn ghost sm" type="button" aria-label="Menu" @click="store.navOpen = !store.navOpen">☰</button>
      <RouterLink to="/" class="brand-sm"><ItemIcon id="create:precision_mechanism" :size="20" /> Create Machines</RouterLink>
    </header>
    <aside class="side" aria-label="Site">
      <RouterLink to="/" class="brand">
        <span class="logo"><ItemIcon id="create:precision_mechanism" :size="28" /></span>
        <span><b>Create Machines</b><small>for DeceasedCraft</small></span>
      </RouterLink>
      <nav>
        <RouterLink to="/" class="nl" exact-active-class="on"><ItemIcon id="minecraft:oak_planks" :size="18" /><span>Home</span></RouterLink>
        <RouterLink to="/progress" class="nl" active-class="on"><ItemIcon id="minecraft:paper" :size="18" /><span>What to build when</span></RouterLink>
        <div v-for="g in groups" :key="g.label" class="ng">
          <div class="ngl">{{ g.label }}</div>
          <RouterLink v-for="l in g.items" :key="l.to" :to="l.to" class="nl" active-class="on">
            <ItemIcon :id="l.icon" :size="18" /><span class="grow">{{ l.label }}</span>
            <span v-if="'tier' in l && l.tier" class="dot" :class="String(l.tier).toLowerCase()" :title="l.tier + ' game'" />
          </RouterLink>
        </div>
      </nav>
      <div class="side-foot">
        <div>Beta DH 5.10.17 · Forge 1.20.1</div>
        <div>Create 6.0.6</div>
      </div>
    </aside>
    <div class="scrim-nav" @click="store.navOpen = false" />
    <main class="main">
      <RouterView />
      <footer class="foot">
        <p>Recipes come from the pack’s KubeJS scripts. Machine numbers come from the pack’s configs and the source code of Create, Immersive Engineering, Crafts &amp; Additions, Create Diesel Generators, Create Big Cannons, Extreme Reactors and Refined Storage. If JEI shows something different, trust JEI.</p>
        <p>Icons and 3D blocks are rendered from the textures and models of Minecraft and the mods; they belong to their authors (see <RouterLink to="/credits">Credits</RouterLink>). A free fan guide, not affiliated with Mojang or the mod authors.</p>
      </footer>
    </main>
    <ItemDrawer />
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: var(--sidebar) minmax(0, 1fr); min-height: 100vh; }
.side {
  position: sticky; top: 0; height: 100vh; overflow-y: auto; background: var(--bg-2); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 18px 12px;
}
.brand { display: flex; align-items: center; gap: 12px; padding: 6px 8px 18px; color: var(--text); text-decoration: none; }
.brand .logo { width: 42px; height: 42px; border-radius: 11px; display: grid; place-items: center; background: linear-gradient(145deg, #3a2f19, #241d10); border: 1px solid #5b4720; }
.brand b { display: block; font-size: 15px; }
.brand small { display: block; color: var(--muted); font-size: 12px; }
nav { flex: 1; }
.ng { margin-top: 14px; }
.ngl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 700; padding: 0 10px 6px; }
.nl { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 8px; color: var(--text-2); font-size: 14px; font-weight: 500; text-decoration: none; }
.nl:hover { background: var(--surface); color: var(--text); text-decoration: none; }
.nl.on { background: var(--surface-2); color: var(--text); box-shadow: inset 2px 0 0 var(--accent); }
.dot { width: 7px; height: 7px; border-radius: 50%; }
.dot.early { background: var(--early); } .dot.mid { background: var(--mid); } .dot.late { background: var(--late); }
.side-foot { padding: 14px 10px 4px; font-size: 12px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 16px; }
.main { min-width: 0; }
.foot { max-width: 1240px; margin: 0 auto; padding: 24px 32px 40px; border-top: 1px solid var(--border); }
.foot p { font-size: 12.5px; color: var(--muted); max-width: 900px; }
.topbar { display: none; }
.scrim-nav { display: none; }
@media (max-width: 960px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .topbar { display: flex; align-items: center; gap: 8px; position: sticky; top: 0; z-index: 40; height: 52px; padding: 0 10px; background: var(--bg-2); border-bottom: 1px solid var(--border); }
  .brand-sm { display: flex; align-items: center; gap: 8px; color: var(--text); font-weight: 700; }
  .side { position: fixed; z-index: 50; left: 0; top: 0; width: 280px; transform: translateX(-100%); transition: transform 0.2s; }
  .open .side { transform: none; }
  .open .scrim-nav { display: block; position: fixed; inset: 0; z-index: 45; background: rgba(0, 0, 0, 0.5); }
  .foot { padding: 20px 16px 32px; }
}
</style>
