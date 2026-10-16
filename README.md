# DeceasedCraft Create Machines

A website with compact, resource-efficient Create builds for the DeceasedCraft modpack (Beta DH 5.10.17, Forge 1.20.1, Create 6.0.6):

- **Production**: ammo line, gun-part ring and Metalworks, with 3D models and layer-by-layer grids
- **Rotational power**: water wheels and windmill, coal boiler, level 18 boiler, and a full 20-engine diesel plant with pumpjack and distillation
- **Electricity**: thermoelectric row, alternator banks and an Extreme Reactor
- **Reference**: a combined shopping list, every item and recipe with its crafting station, and the pack rules that change things

Every build lists its parts, the raw materials behind them (crafts are batched, so leftovers are shared), and a crafting plan in an order that works.

Live site: https://iamn4m3l3ss.github.io/deceasedcraft-create-machines/

## How it's built

Vue 3 + Vite + TypeScript, with three.js for the 3D views. The built site is in `docs/`, which GitHub Pages serves.

| Path | What it is |
| --- | --- |
| `src/data/items.ts` | Every item: name, mod, stand-in icon |
| `src/data/recipes.ts` | Recipes as they are in the pack (KubeJS overrides plus the mods' own) |
| `src/data/builds.ts` | The builds: parts, steps, stats, layer grids |
| `src/data/sections.ts` | The overview pages and comparison tables |
| `src/lib/bom.ts` | Turns a parts list into raw materials and a crafting plan |
| `src/three/viewer.js` | The 3D models |
| `tools/assets/` | Scripts that turn the game's models and textures into the icons and 3D blocks |
| `public/icons`, `public/mc` | The rendered icons and the block models and textures for the 3D views |
| `docs/` | The built site (don't edit by hand) |

## Working on it

You need Node.js 18 or newer.

```
npm install
npm run dev      # local preview with live reload
npm run build    # type-check and rebuild docs/
```

Commit the updated `docs/` folder together with your source changes; that's what goes live.

## GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, folder **/docs** → Save. The site appears at the address above about a minute later.

## Textures

Item icons and 3D blocks are rendered from the real Minecraft and mod textures and models (credits on the site's Credits page). How to rebuild them is in `tools/assets/README.md`.
