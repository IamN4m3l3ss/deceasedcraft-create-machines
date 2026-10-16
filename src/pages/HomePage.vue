<script setup lang="ts">
import { BUILD } from '../data/builds'
import ItemIcon from '../components/ItemIcon.vue'
import BuildCard from '../components/BuildCard.vue'

const sections = [
  { to: '/production', icon: 'create:deployer', stat: '9 deployers', title: 'Ammo & gun parts', text: 'One 3-station line for 15 kinds of rounds, one looping ring for all gun-part kits, and a saw-and-press line for plates and recoil springs.' },
  { to: '/power', icon: 'create:steam_engine', stat: 'up to 327,680 SU', title: 'Rotational power', text: 'Windmills and water wheels early, coal boilers mid game, then a level 18 boiler or a 20-engine diesel plant. No lake needed.' },
  { to: '/electricity', icon: 'createaddition:alternator', stat: 'up to 6,480 FE/t', title: 'Electricity', text: 'Thermoelectric generators between lava and water, alternators on your boiler, then big banks or an Extreme Reactor.' },
]
const road = [
  { tier: 'Early', items: ['windmill', 'thermo', 'metal', 'ammo'] },
  { tier: 'Mid', items: ['boiler4', 'altbank', 'ring'] },
  { tier: 'Late', items: ['boiler18', 'diesel', 'bigbank', 'reactor'] },
]
</script>

<template>
  <div class="page">
    <section class="hero card">
      <div class="hero-b">
        <div class="eyebrow">DeceasedCraft Beta DH 5.10.17 · Create 6.0.6</div>
        <h1>Create Machines</h1>
        <p>Small, cheap factory builds for the pack’s own recipes: automated ammo and gun parts, plus the rotational power and electricity to run them. Every build has a 3D model, a parts list with the raw materials behind it, and every recipe with the station that makes it.</p>
        <div class="row wrap" style="gap: 10px; margin-top: 18px">
          <RouterLink to="/build/windmill" class="btn primary">Start with a windmill</RouterLink>
          <RouterLink to="/shopping" class="btn">Open the shopping list</RouterLink>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="slots">
          <span v-for="id in ['create:precision_mechanism','create:deployer','createdieselgenerators:huge_diesel_engine','createaddition:alternator','immersiveengineering:thermoelectric_generator','create:steam_engine','tacz:ammo_9mm','createbigcannons:recoil_spring','bigreactors:reinforced_reactorcasing']" :key="id" class="hs"><ItemIcon :id="id" :size="36" /></span>
        </div>
      </div>
    </section>

    <div class="grid-3" style="margin-top: 20px">
      <RouterLink v-for="s in sections" :key="s.to" :to="s.to" class="card sec">
        <div class="row" style="justify-content: space-between"><span class="si"><ItemIcon :id="s.icon" :size="28" /></span><span class="chip accent">{{ s.stat }}</span></div>
        <h2>{{ s.title }}</h2>
        <p>{{ s.text }}</p>
        <span class="go">Open →</span>
      </RouterLink>
    </div>

    <section class="card gloss">
      <div class="card-b">
        <h2 style="margin-bottom: 10px">New to Create? Five words you’ll see a lot</h2>
        <dl>
          <div><dt>SU</dt><dd>Stress units: how much rotational power a source gives and a machine uses. A network stops if machines need more SU than the sources make.</dd></div>
          <div><dt>RPM</dt><dd>How fast shafts turn. Faster machines work quicker but use more SU. Cogwheels change the speed.</dd></div>
          <div><dt>Deployer</dt><dd>A robot hand that uses its held item on whatever passes under it. Most recipes here are a row of deployers over a belt.</dd></div>
          <div><dt>Sequenced assembly</dt><dd>A recipe done in steps on a belt (add this, then press, then add that), sometimes several rounds.</dd></div>
          <div><dt>FE</dt><dd>Forge Energy, i.e. electricity. IE and Refined Storage machines run on it; FE/t is per tick (20 ticks a second).</dd></div>
        </dl>
        <p class="small" style="margin: 10px 0 0">Click any item on this site to see how it’s made and what it’s for.</p>
      </div>
    </section>

    <h2 style="margin: 32px 0 6px">How it fits together</h2>
    <p>New world? Put up a 64-sail windmill for power, then the Metalworks line for plates and springs, and the ammo line. A row of thermoelectric generators between lava and water gives you electricity for the IE Metal Press without any fuel.</p>
    <div class="road">
      <div v-for="r in road" :key="r.tier" class="lane">
        <div class="lane-h"><span class="chip" :class="r.tier.toLowerCase()">{{ r.tier }} game</span></div>
        <div class="stack-s"><BuildCard v-for="id in r.items" :key="id" :build="BUILD[id]" /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); overflow: hidden; background: radial-gradient(120% 140% at 100% 0%, rgba(232, 169, 58, 0.16), transparent 55%), var(--surface); }
.hero-b { padding: 32px 32px 30px; }
.hero h1 { font-size: 40px; margin: 8px 0 10px; letter-spacing: -0.03em; }
.hero p { font-size: 16px; max-width: 640px; }
.hero-art { display: grid; place-items: center; padding: 24px; }
.slots { display: grid; grid-template-columns: repeat(3, 64px); gap: 8px; transform: rotate(-4deg); }
.hs { width: 64px; height: 64px; display: grid; place-items: center; background: var(--slot); border-radius: 10px; border: 1px solid #000; box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.5), 0 10px 24px rgba(0, 0, 0, 0.35); }
.sec { display: flex; flex-direction: column; padding: 18px; color: inherit; text-decoration: none; transition: border-color 0.15s, transform 0.15s; }
.sec:hover { border-color: var(--accent); transform: translateY(-2px); text-decoration: none; }
.sec h2 { margin: 14px 0 6px; font-size: 18px; }
.sec p { font-size: 14px; flex: 1; }
.si { width: 48px; height: 48px; border-radius: 10px; background: var(--slot); display: grid; place-items: center; box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.45); }
.go { color: var(--accent-2); font-weight: 600; font-size: 14px; }
.gloss { margin-top: 20px; }
.gloss dl { margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.gloss dt { font-weight: 700; color: var(--accent-2); }
.gloss dd { margin: 2px 0 0; color: var(--text-2); font-size: 14px; }
.road { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 14px; }
.lane-h { margin-bottom: 10px; }
.stack-s { display: flex; flex-direction: column; gap: 10px; }
@media (max-width: 1100px) { .gloss { margin-top: 20px; }
.gloss dl { margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.gloss dt { font-weight: 700; color: var(--accent-2); }
.gloss dd { margin: 2px 0 0; color: var(--text-2); font-size: 14px; }
.road { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 800px) { .hero { grid-template-columns: minmax(0, 1fr); } .hero-art { display: none; } .hero-b { padding: 22px; } .hero h1 { font-size: 30px; } }
</style>
