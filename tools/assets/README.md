# Icons and 3D blocks

The site's item icons (`public/icons`) and the blocks in the 3D views (`public/mc`) are made from the real Minecraft and mod assets. To rebuild them:

1. Clone the asset sources next to each other (paths are set in `ROOTS` in `resolve.py`; change `ASSET_BASE` if you put them elsewhere):
   - vanilla: `InventivetalentDev/minecraft-assets`, branch `1.20.1`
   - Create, Immersive Engineering, Crafts & Additions, Create Diesel Generators, Create Big Cannons, Extreme Reactors, Refined Storage: their GitHub repos, 1.20.1 branches
   - TaCZ ammo icons: the pack's `overrides/tacz/tacz_default_gun`
2. `python3 tools/assets/make_wanted.py` — lists every item in `src/data/items.ts` plus the blocks the 3D views use
3. `python3 tools/assets/resolve.py` — follows each model's parent chain and writes `public/mc/models.json`, the textures and OBJ files
4. `node tools/assets/render_icons.mjs` — renders `public/icons/<namespace>/<item>.png` and `manifest.json` in headless Chromium (needs Playwright)

Items whose files aren't public (DeceasedCraft, Apocalypse Now) keep their hand-drawn stand-in icons.
