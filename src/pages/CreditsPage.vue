<script setup lang="ts">
import ItemIcon from '../components/ItemIcon.vue'
const rows = [
  { who: 'Minecraft', owner: 'Mojang Studios', lic: 'Used as fan content under the Minecraft Usage Guidelines', icon: 'minecraft:crafting_table' },
  { who: 'Create', owner: 'The Create Team', lic: 'Assets: all rights reserved (code is MIT)', icon: 'create:precision_mechanism' },
  { who: 'Immersive Engineering', owner: 'BluSunrize and contributors', lic: 'Blu’s License of Common Sense', icon: 'immersiveengineering:thermoelectric_generator' },
  { who: 'Create Crafts & Additions', owner: 'MRH0', lic: 'MIT', icon: 'createaddition:alternator' },
  { who: 'Create Diesel Generators', owner: 'George VI', lic: 'MIT', icon: 'createdieselgenerators:huge_diesel_engine' },
  { who: 'Create Big Cannons', owner: 'Cannoneers of Create', lic: 'Textures: CC BY-NC-SA 4.0', icon: 'createbigcannons:recoil_spring' },
  { who: 'Refined Storage', owner: 'Refined Mods', lic: 'MIT', icon: 'refinedstorage:controller' },
  { who: 'Extreme Reactors', owner: 'ZeroNoRyouki', lic: 'No licence file published', icon: 'bigreactors:reinforced_reactorcasing' },
  { who: 'Timeless & Classics Zero (default gun pack)', owner: 'The TaCZ team', lic: 'Ammo icon from the pack’s bundled gun pack', icon: 'tacz:ammo_9mm' },
]
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div class="big-icon"><ItemIcon id="minecraft:paper" :size="40" /></div>
      <div>
        <div class="eyebrow">Reference</div>
        <h1>Credits</h1>
        <p>The item icons and 3D blocks on this site are rendered from the textures and models of Minecraft and these mods. All of them belong to their authors. This is a free, non-commercial fan guide for the DeceasedCraft modpack and isn’t affiliated with or endorsed by any of them.</p>
      </div>
    </div>
    <section class="card">
      <div class="tbl-wrap" style="border: 0">
        <table class="tbl">
          <thead><tr><th>Textures and models from</th><th>By</th><th>Licence</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.who">
              <td><span class="row" style="gap: 10px"><ItemIcon :id="r.icon" :size="24" />{{ r.who }}</span></td>
              <td>{{ r.owner }}</td>
              <td>{{ r.lic }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <p class="small" style="margin-top: 16px">If you made one of these and want your work taken off this site, open an issue on the GitHub repository and it will be removed. Icons for the DeceasedCraft and Apocalypse Now items are hand-drawn stand-ins, because those mods’ files aren’t public.</p>
  </div>
</template>
