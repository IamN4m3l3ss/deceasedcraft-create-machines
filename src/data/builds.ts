import type { Stack } from './recipes'

export interface PartGroup { label: string; items: Stack[]; note?: string; optional?: boolean }
export interface Stat { label: string; value: string; hint?: string }
export interface Table { title?: string; head: string[]; rows: string[][]; note?: string; highlight?: number[] }
export interface Layer { y: number; name: string; cap: string; rows: string[]; /** the same layer repeats up to this y */ to?: number }
export interface Build {
  id: string
  section: 'production' | 'kinetic' | 'electric'
  tier?: 'Early' | 'Mid' | 'Late'
  title: string
  nav: string
  icon: string
  tagline: string
  intro: string
  stats: Stat[]
  scene: string
  /** what goes in and what comes out, for the summary strip at the top */
  io: { in: string[]; inText?: string; out: string[]; outText?: string }
  /** token grid for the layer view (production lines and the reactor) */
  grid?: { zs: number[]; layers: Layer[]; path?: number[][]; loop?: boolean; item?: string; fall?: [number, number, number, number, string][] }
  parts: PartGroup[]
  stock?: { items: Stack[]; note: string }
  running?: string
  steps: string[]
  tables?: Table[]
  callouts?: { title: string; body: string; tone?: 'info' | 'warn' | 'ok' }[]
  /** other versions of the build (a cheaper starter, a bigger one); each replaces the fields it sets */
  variants?: Variant[]
  /** label for the main version in the version picker */
  mainLabel?: string
  mainBlurb?: string
}
export type Variant = { id: string; label: string; blurb: string } & Partial<Omit<Build, 'id' | 'variants' | 'section' | 'mainLabel' | 'mainBlurb'>>
/** the build with a variant's fields applied */
export function withVariant(b: Build, vid?: string): Build {
  const v = vid && b.variants ? b.variants.find((x) => x.id === vid) : undefined
  return v ? { ...b, ...v, id: b.id } : b
}

export const BUILDS: Build[] = [
  // ======================================================= production
  {
    id: 'ammo', section: 'production', title: 'Ammo line', nav: 'Ammo line', icon: 'tacz:ammo_9mm',
    tagline: '2 deployers · 6 × 2 · 9mm, .45 and every standard round',
    intro: 'Casings go into the input chest, finished rounds come out of the output chest. Every standard caliber (9mm, .45 ACP and ten more) takes the same two steps: a gunpowder pinch, then a lead nugget. So the line never changes; you only feed it a different casing. Pick a round below to see exactly what goes where.',
    mainLabel: 'Standard', mainBlurb: '2 deployers. 14 of the 15 rounds.',
    stats: [
      { label: 'Deployers', value: '2' }, { label: 'Footprint', value: '6 × 2', hint: '4 tall' },
      { label: 'Stress', value: '8 SU/RPM', hint: '256 SU at 32 RPM' }, { label: 'Speed', value: '≈ 1 round/s', hint: 'at 64 RPM' },
    ],
    scene: 'ammo',
    io: { in: ['deceasedcraft:bullet_casing_9mm_round', 'createbigcannons:gunpowder_pinch', 'immersiveengineering:nugget_lead'], out: ['tacz:ammo_9mm', 'tacz:ammo_45acp'], outText: 'or any other standard round' },
    grid: {
      zs: [0, 1], path: [[1, 0], [4, 0]], loop: false, item: 'casing',
      layers: [
        { y: 0, name: 'y0 · belt', cap: 'A 4-long belt from x1 to x4 between the input chest (x0) and output chest (x5). The gearbox behind x1 turns the belt’s first pulley.', rows: ['Ci B>*i B> B> B>*o Co', '. G . . . .'] },
        { y: 1, name: 'y1 · funnels', cap: 'The two funnels sit on top of the belt’s end tiles, against the chests. Keep x2–x3 clear: the deployer hands reach through. The tower shaft rises behind x1.', rows: ['. ~ ~ ~ ~ .', '. So . . . .'] },
        { y: 2, name: 'y2 · deployers', cap: 'D1 and D2 face down over x2 and x3. The gearbox at x1 passes the tower’s rotation along the deployer row.', rows: ['. G D1 D2 . .', '. G . . . .'] },
        { y: 3, name: 'y3 · feed + power', cap: 'A hopper on each deployer keeps it stocked (put chests on y4 for long runs). Power comes into the tower at x1 from above.', rows: ['. . H H . .', '. Pw . . . .'] },
      ],
    },
    parts: [
      { label: 'Line', items: [['create:deployer', 2], ['create:belt_connector', 1], ['create:shaft', 1], ['create:gearbox', 3], ['minecraft:hopper', 2], ['minecraft:chest', 2], ['create:andesite_funnel', 2]] },
      { label: 'Casings (once)', optional: true, note: 'The IE Metal Press multiblock and the mold for each caliber you make. Molds come from loot and traders and are never used up.', items: [['deceasedcraft:mold_bullet_casing_9mm', 1]] },
    ],
    stock: { items: [['createbigcannons:gunpowder_pinch', 64], ['immersiveengineering:nugget_lead', 64]], note: 'Per 64 standard rounds: 16 gunpowder (as pinches), about 7 lead ingots (as nuggets) and 16 brass ingots for the casings.' },
    steps: [
      'Lay a 4-long belt from x1 to x4. Put the input chest at x0 and place an andesite funnel against it, on top of the belt’s first tile. Placed normally, a funnel <b>pulls</b> from the chest onto the belt.',
      'Put the output chest at x5 and <b>sneak-place</b> its funnel so it puts items into the chest. A wrench flips a funnel between pulling and pushing.',
      'Put D1 and D2 on y2 above x2 and x3, facing down, with a 1-block gap above the belt. Their shaft ends must point east–west so they pass rotation along the row. Wrench them if they don’t.',
      'Build the power tower behind x1: gearbox (y0), vertical shaft (y1), gearbox (y2), then a gearbox in front of D1. Feed power in from above.',
      'Check the belt runs from x1 toward x4. If it runs backwards, add one gearbox to the incoming shaft (straight through a gearbox reverses rotation).',
      'Put a hopper on each deployer and fill them as the table below says.',
    ],
    callouts: [{ title: 'Every deployer must hold something', body: 'A casing waits forever under a deployer with an empty hand. Keep both stocked, or put a lever on a deployer to switch it off.', tone: 'warn' }],
    variants: [
      {
        id: 'starter', label: 'Starter', blurb: 'Hand-fed, no chests. Cheapest way to start.',
        tagline: '2 deployers · hand-fed · water wheel or hand crank',
        intro: 'The same two deployers and belt, without chests, funnels or hoppers. Drop casings on the start of the belt and pick rounds off the end, where they stop and wait. Right-click each deployer with its item to load it. It turns from a hand crank or a single water wheel, so you can build it the moment you have your first deployers.',
        stats: [{ label: 'Deployers', value: '2' }, { label: 'Footprint', value: '4 × 2', hint: '4 tall' }, { label: 'Stress', value: '8 SU/RPM', hint: '256 SU at 32 RPM' }, { label: 'Power', value: 'hand crank', hint: 'or a water wheel' }],
        grid: {
          zs: [0, 1], path: [[1, 0], [4, 0]], loop: false, item: 'casing',
          layers: [
            { y: 0, name: 'y0 · belt', cap: 'A 4-long belt. Drop casings on x1, take rounds off x4: they stop at the end of the belt.', rows: ['. B>* B> B> B>* .', '. G . . . .'] },
            { y: 1, name: 'y1 · gap', cap: 'Keep x2–x3 clear for the deployer hands.', rows: ['. . ~ ~ . .', '. So . . . .'] },
            { y: 2, name: 'y2 · deployers', cap: 'D1 and D2 face down over x2 and x3.', rows: ['. G D1 D2 . .', '. G . . . .'] },
            { y: 3, name: 'y3 · power', cap: 'Put a hand crank on top of the tower’s gearbox, or run a shaft in from a water wheel.', rows: ['. . . . . .', '. Pw . . . .'] },
          ],
        },
        parts: [
          { label: 'Line', items: [['create:deployer', 2], ['create:belt_connector', 1], ['create:shaft', 1], ['create:gearbox', 3]] },
          { label: 'Power, pick one', items: [['create:hand_crank', 1], ['create:water_wheel', 1]], note: 'A hand crank gives 256 SU at 32 RPM while you hold it, exactly enough. A water wheel gives 256 SU at 8 RPM, hands-free but slower.' },
        ],
        stock: undefined,
        steps: [
          'Lay a 4-long belt and put D1 and D2 two blocks above its middle tiles, facing down, shaft ends east–west.',
          'Build the power tower behind the first tile: gearbox, vertical shaft, gearbox, and a gearbox in front of D1.',
          'Put a hand crank on the top gearbox (or bring in a shaft from a water wheel).',
          'Right-click D1 with gunpowder pinches and D2 with lead nuggets. A deployer takes the whole stack.',
          'Drop casings on the first tile. Rounds pile up at the far end.',
        ],
      },
      {
        id: 'heavy', label: 'All 15', blurb: '3 deployers. Adds 37mm cannon shells.',
        tagline: '3 deployers · 7 × 2 · all 15 rounds',
        intro: 'Only the 37mm APHE shell needs a third step. If you make it, use this longer version: one more belt tile and a third deployer that keeps a Block of Lead. Standard rounds pass under D3 untouched.',
        stats: [{ label: 'Deployers', value: '3' }, { label: 'Footprint', value: '7 × 2', hint: '4 tall' }, { label: 'Stress', value: '12 SU/RPM', hint: '384 SU at 32 RPM' }, { label: 'Speed', value: '≈ 1 round/s', hint: 'at 64 RPM' }],
        grid: {
          zs: [0, 1], path: [[1, 0], [5, 0]], loop: false, item: 'casing',
          layers: [
            { y: 0, name: 'y0 · belt', cap: 'Belt from x1 to x5, input chest at x0, output chest at x6.', rows: ['Ci B>*i B> B> B> B>*o Co', '. G . . . . .'] },
            { y: 1, name: 'y1 · funnels', cap: 'Funnels on the end tiles; x2–x4 stay clear for the hands.', rows: ['. ~ ~ ~ ~ ~ .', '. So . . . . .'] },
            { y: 2, name: 'y2 · deployers', cap: 'D1–D3 face down over x2–x4.', rows: ['. G D1 D2 D3 . .', '. G . . . . .'] },
            { y: 3, name: 'y3 · feed + power', cap: 'Hoppers on the deployers, power into the tower from above.', rows: ['. . H H H . .', '. Pw . . . . .'] },
          ],
        },
        parts: [
          { label: 'Line', items: [['create:deployer', 3], ['create:belt_connector', 1], ['create:shaft', 1], ['create:gearbox', 3], ['minecraft:hopper', 3], ['minecraft:chest', 2], ['create:andesite_funnel', 2]] },
          { label: 'Casings (once)', optional: true, note: 'The IE Metal Press multiblock and a mold per caliber.', items: [['deceasedcraft:mold_bullet_casing_37mm', 1]] },
        ],
        stock: { items: [['quark:gunpowder_sack', 16], ['minecraft:tnt', 16], ['immersiveengineering:storage_lead', 16]], note: 'Per 16 shells. For standard rounds, D3 keeps one Block of Lead so it never stands empty.' },
      },
    ],
  },
  {
    id: 'ring', section: 'production', title: 'Parts ring', nav: 'Parts ring', icon: 'deceasedcraft:rifle_assembly_parts',
    tagline: '6 deployers · 9 × 5 · all gun-part kits',
    intro: 'Gun-part kits loop 4 times through six steps, so a straight line would need 24 deployers. Here four belts form a loop: the item keeps circling past six stations until it’s finished, then a filtered brass funnel takes it off. All 7 gun-part kits and the attachment parts run on this one ring. You only swap the blueprint and the special material.',
    stats: [
      { label: 'Deployers', value: '6' }, { label: 'Footprint', value: '9 × 5', hint: '4 tall' },
      { label: 'Stress', value: '24 SU/RPM', hint: '768 SU at 32 RPM' }, { label: 'Kits', value: '8 types' },
    ],
    scene: 'ring',
    io: { in: ['apocalypsenow:cardboard_box', 'immersiveengineering:stick_steel', 'immersiveengineering:plate_steel', 'createbigcannons:recoil_spring', 'immersiveengineering:component_steel'], inText: '+ iron, steel or netherite scrap', out: ['deceasedcraft:pistol_assembly_parts', 'deceasedcraft:rifle_assembly_parts', 'deceasedcraft:sniper_assembly_parts', 'deceasedcraft:attachment_assembly_parts'] },
    grid: {
      zs: [-1, 0, 1, 2, 3], path: [[8, 0], [0, 0], [0, 2], [8, 2], [8, 0]], loop: true, item: 'box',
      layers: [
        { y: 0, name: 'y0 · belts', cap: 'A (north) flows west, D (x0) south, C (south) east, B (x8) north. The gearbox at x1 drives all four: A and D directly, C through the added pulley at x1, B through the shaft row.', rows: ['. . . . . . . . Ci', 'Bv* B<* B< B< B< B< B< B< B<*i', 'Bv* G S- S- S- S- S- S- B^*', 'B>* B>* B> B> B>b B> B> B>* B^*', '. . . . Co . . . .'] },
        { y: 1, name: 'y1 · gap', cap: 'Keep the space above belt A clear under the stations. A vertical shaft links the y0 and y2 gearboxes.', rows: ['. . . . . . . . .', '. . ~ ~ ~ ~ ~ ~ .', '. So . . . . . . .', '. . . . . . . . .', '. . . . . . . . .'] },
        { y: 2, name: 'y2 · stations', cap: 'S1 sits over x7, right after items join belt A. S6 is over x2. The front gearbox at x1 feeds the row.', rows: ['. . . . . . . . .', '. G S6 S5 S4 S3 S2 S1 .', '. G . . . . . . .', '. . . . . . . . .', '. . . . . . . . .'] },
        { y: 3, name: 'y3 · feed + power', cap: 'Hoppers over S2–S6. S1 only holds a blueprint. Power goes in from above at x1, and nowhere else.', rows: ['. . . . . . . . .', '. . H H H H H . .', '. Pw . . . . . . .', '. . . . . . . . .', '. . . . . . . . .'] },
      ],
    },
    parts: [
      { label: 'Ring', items: [['create:deployer', 6], ['create:belt_connector', 4], ['create:shaft', 16], ['create:gearbox', 3], ['minecraft:hopper', 5], ['minecraft:chest', 2], ['create:andesite_funnel', 1], ['create:brass_funnel', 1], ['create:filter', 1]] },
      { label: 'Spring press add-on', optional: true, note: 'Lets the ring press spring wire into recoil springs between kits (see step 8).', items: [['create:mechanical_press', 1]] },
    ],
    stock: { items: [['deceasedcraft:pistol_assembly_parts_blueprint', 1], ['immersiveengineering:stick_steel', 16], ['immersiveengineering:plate_steel', 16], ['createbigcannons:recoil_spring', 16], ['immersiveengineering:component_steel', 16], ['minecraft:iron_ingot', 16]], note: 'For 4 pistol kits: S1 holds the blueprint (kept), S2–S6 get 4 of their item per kit.' },
    steps: [
      'Lay four belts as on layer y0. A runs x1–x8 on the north row, D is x0 (2 long), C runs x0–x7 on the south row, and B is x8 (2 long). Each belt’s last tile sits beside the first tile of the next belt.',
      'Right-click belt C at x1 with a shaft to add a pulley there. Fill the middle row: gearbox at x1, then shafts from x2 to x7 into B’s pulley.',
      'Power goes in <b>only</b> through the tower at x1 (gearbox y2 → vertical shaft → gearbox y0). Don’t drive any belt directly. The four belts only form a loop when that bottom gearbox is fed from above.',
      'Check the flow before loading anything. Belt A must move <b>west</b>, toward D. If it moves east, add one gearbox to the incoming shaft. All four belts reverse together.',
      'Put the deployers on y2 over A: S1 at x7 through S6 at x2. The gearbox at x1 on y2 passes power along the row.',
      'Input: chest north of x8 with an andesite funnel placed normally. Exit: chest south of C at x4 with a <b>sneak-placed brass funnel</b>. Put a Filter on it listing the 8 kits.',
      'Load at most 8 cardboard boxes at a time. A packed loop can jam.',
      'Optional: a mechanical press on y2 above belt C at x1, with its shaft north–south, connects straight to the tower’s top gearbox. Spring wire dropped into the input chest is then pressed once per lap and leaves as a Recoil Spring after 3 laps (add Recoil Spring to the filter).',
    ],
    tables: [
      { title: 'Kits', head: ['Kit (base: Cardboard Box)', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'Loops'], rows: [
        ['Pistol / SMG', 'blueprint', 'Steel Rod', 'Steel Plate', 'Recoil Spring', 'Steel Mech. Comp.', 'Iron Ingot', '4'],
        ['Shotgun / Rifle', 'blueprint', 'Steel Rod', 'Steel Plate', 'Recoil Spring', 'Steel Mech. Comp.', 'Steel Ingot', '4'],
        ['Sniper / HMG / Special', 'blueprint', 'Steel Rod', 'Steel Plate', 'Recoil Spring', 'Steel Mech. Comp.', 'Netherite Scrap', '4'],
        ['Attachment parts', 'blueprint', 'Steel Rod', 'Steel Plate', 'skipped', 'Steel Mech. Comp.', 'Rubber', '1']],
        note: 'S2–S5 hold the same items for every kit. To change kit, swap the blueprint in S1 and, if needed, the special material in S6. For attachments, S4 keeps its springs and is just skipped.' },
    ],
  },
  {
    id: 'metal', section: 'production', title: 'Metalworks', nav: 'Metalworks', icon: 'createbigcannons:recoil_spring',
    tagline: 'makes the steel parts for the gun-part ring',
    intro: 'Every gun-part kit needs steel plates, recoil springs and steel rods. This small line makes all three, so build it before the parts ring. Drop steel ingots in and you get steel plates. Drop steel plates in and you get recoil springs (the saw cuts each plate into 3 spring wires, the presses squeeze each wire 3 times). The rolling mill beside it turns steel ingots into rods.',
    stats: [
      { label: 'Footprint', value: '10 × 2', hint: '4 tall' }, { label: 'Stress', value: '28 SU/RPM', hint: '+4 for the rolling mill' },
      { label: 'Per steel plate', value: '3 springs' }, { label: 'Per steel ingot', value: '2 rods', hint: 'rolling mill' },
    ],
    scene: 'metal',
    io: { in: ['immersiveengineering:ingot_steel', 'immersiveengineering:plate_steel'], inText: 'ingots for plates and rods, plates for springs', out: ['immersiveengineering:plate_steel', 'createbigcannons:recoil_spring', 'immersiveengineering:stick_steel'], outText: 'all the steel parts the ring needs' },
    grid: {
      zs: [0, 1], path: [[1, 0], [8, 0]], loop: false, item: 'plate',
      layers: [
        { y: 0, name: 'y0 · belt', cap: 'Chest → short belt (x1–x2) → saw facing up (x3) → main belt (x4–x8) → output chest. The three cogwheels mesh in a row, so the saw spins opposite to both belts.', rows: ['Ci B>*i B>* X B>* B> B> B> B>*o Co', '. . c c c . . . G .'] },
        { y: 1, name: 'y1 · gap', cap: 'Keep x5–x7 clear for the press heads. The tower shaft rises at x8.', rows: ['. . . . . ~ ~ ~ . .', '. . . . . . . . So .'] },
        { y: 2, name: 'y2 · presses', cap: 'Three presses with their shafts along the row, powered from the gearbox at x8.', rows: ['. . . . . P1 P2 P3 G .', '. . . . . . . . G .'] },
        { y: 3, name: 'y3 · power', cap: 'Power comes in from above at x8.', rows: ['. . . . . . . . . .', '. . . . . . . . Pw .'] },
      ],
    },
    parts: [
      { label: 'Saw and presses', items: [['create:mechanical_press', 3], ['create:mechanical_saw', 1], ['create:belt_connector', 2], ['create:shaft', 5], ['create:cogwheel', 3], ['create:gearbox', 3], ['minecraft:chest', 2], ['create:andesite_funnel', 2], ['create:filter', 1]] },
      { label: 'Rod station', note: 'Chest, hopper, rolling mill, hopper, chest, stacked; a shaft into the mill’s side.', items: [['createaddition:rolling_mill', 1], ['minecraft:hopper', 2], ['minecraft:chest', 2], ['create:shaft', 1]] },
    ],
    steps: [
      'A 2-block belt (x1–x2) carries items from the input chest into the saw at x3. Place the saw at belt level <b>facing up</b>, with its shaft north–south, and put a Filter with <b>Spring Wire</b> on it. Steel plate has two cutting recipes, so without a filter the saw alternates between spring wire and steel wire.',
      'Three cogwheels behind x2, x3 and x4 mesh in a row. The saw then spins opposite to both belts, which is what makes all three move items east. The main belt drives the whole chain.',
      'Put the presses on y2 over x5–x7 with their shafts along the row. They’re powered from the tower at x8.',
      'If items come back out of the saw toward the input, the line runs backwards. Reverse the incoming shaft.',
      'Rods: stack chest, hopper (pointing down), rolling mill, hopper, chest, and run a shaft into the mill’s side. 1 steel ingot → 2 Steel Rods, twice the pack’s wirecutter recipe.',
    ],
    tables: [
      { title: 'What each kit costs', head: ['Item', 'Steel', 'Other'], rows: [
        ['Pistol or SMG kit', '15⅓', '4 iron ingots, 4 copper, 1 cardboard box (8 paper + 1 slimeball)'],
        ['Shotgun or Rifle kit', '19⅓', '4 copper, 1 cardboard box'],
        ['Sniper, HMG or Special kit', '15⅓', '4 netherite scrap, 4 copper, 1 cardboard box'],
        ['Attachment parts', '3½', '1 rubber, 1 copper, 1 cardboard box'],
        ['64 standard rounds', '0', '16 brass (8 copper + 8 zinc), 16 gunpowder, 64 lead nuggets (about 7 ingots)']],
        note: 'More than half the steel in a kit goes into its four Steel Mechanical Components (8 of 15⅓). If steel runs short, more blast furnaces help most.' },
      { title: 'Supply, cheapest route', head: ['Need', 'Route in this pack', 'Later upgrade'], rows: [
        ['Brass', 'IE Alloy Kiln: copper + zinc → 2 brass, runs on coal', 'Create mixer on a heated blaze burner'],
        ['Casings', 'IE Metal Press + caliber mold, 2,400 FE per press', 'No other recipe'],
        ['Steel', 'IE Blast Furnace on coke, 60 s per ingot; build 2–3', 'Superheated mixer: iron + coke dust → steel'],
        ['Lead nuggets', 'Smelt raw lead, then 1 ingot → 9 nuggets', 'Crushing wheels + washing: ≈ 9.75 nuggets per raw lead'],
        ['Gunpowder pinches', '1 gunpowder → 4 pinches', 'Washing crushed zinc: 25% gunpowder byproduct'],
        ['Steel Mech. Components', 'IE Engineer’s Workbench, components blueprint: 2 steel plates + 1 copper', 'IE Automated Workbench']] },
    ],
  },

  {
    id: 'sand', section: 'production', tier: 'Early', title: 'Gravel & sand tower', nav: 'Gravel & sand', icon: 'minecraft:sand',
    tagline: 'cobble → gravel → sand · no water, no lava',
    intro: 'Sand turns into glass (fuel rods need it) and sandstone (crush it in the IE Crusher for saltpeter, half of every gunpowder); gravel turns into netherrack for blaze cakes. This tower makes them out of nothing. The Create Cobblestone generator on top makes cobblestone from rotation alone, a funnel drops it into the first pair of crushing wheels (cobblestone → gravel), and the gravel falls straight into the second pair (gravel → sand).',
    mainLabel: 'Sand', mainBlurb: 'Two crusher pairs. Makes sand.',
    stats: [{ label: 'Output', value: '≈ 9 sand/s', hint: 'at 128 RPM' }, { label: 'Footprint', value: '5 × 4', hint: '6 tall' }, { label: 'Stress', value: '40 SU/RPM', hint: '2,560 SU at 64 RPM' }, { label: 'Input', value: 'nothing' }],
    scene: 'sand',
    io: { in: [], inText: 'only rotation', out: ['minecraft:sand'], outText: '+ a little flint and clay' },
    grid: {
      zs: [-2, -1, 0, 1],
      fall: [[2, 0, 4.1, 3.4, 'minecraft:cobblestone'], [2, 0, 2.6, 1.4, 'minecraft:gravel'], [2, 0, 0.6, 0.1, 'minecraft:sand']],
      layers: [
        { y: 0, name: 'y0 · output', cap: 'A hopper right under the lower gap, pointing south into the output chest.', rows: ['. . . . .', '. . . . .', '. . Hs . .', '. . Co . .'] },
        { y: 1, name: 'y1 · crushers: sand', cap: 'Second pair: two crushing wheels with their axles north–south and a one-block gap at x2. A cogwheel sits on each axle behind.', rows: ['. . . . .', '. z- . z+ .', '. Wl . Wr .', '. . . . .'] },
        { y: 2, name: 'y2 · gearing', cap: 'Power comes in at x0 and runs through two gearboxes. Each gearbox turns its column of cogwheels the opposite way, so the left and right wheels spin toward each other. Keep x2 clear: gravel falls through here.', rows: ['Pw G S- G .', '. z+ . z- .', '. . . . .', '. . . . .'] },
        { y: 3, name: 'y3 · crushers: gravel', cap: 'First pair, the same as the second: cobblestone in, gravel out.', rows: ['. . . . .', '. z- . z+ .', '. Wl . Wr .', '. . . . .'] },
        { y: 4, name: 'y4 · funnel', cap: 'An andesite funnel on the bottom of the generator, facing down. It drops 64 cobblestone at a time into the gap below.', rows: ['. . . . .', '. z+ . . .', '. . Fd . .', '. . . . .'] },
        { y: 5, name: 'y5 · generator', cap: 'The Mechanical Generator, turned so its axle runs north–south. A cogwheel on its back axle meshes with the left cog column, which powers it.', rows: ['. . . . .', '. z- z+ . .', '. . Gn . .', '. . . . .'] },
      ],
    },
    parts: [
      { label: 'Tower', items: [['createcobblestone:mechanical_generator', 1], ['create:crushing_wheel', 4], ['create:cogwheel', 9], ['create:gearbox', 2], ['create:shaft', 2], ['create:andesite_funnel', 1], ['minecraft:hopper', 1], ['minecraft:chest', 1]] },
    ],
    steps: [
      'Put the generator up high (y5) and right-click it with cobblestone if it shows another stone type. Turn it so its axle runs north–south.',
      'Under it, an andesite funnel facing down. Placed against the generator’s bottom it pulls cobblestone out and drops it.',
      'Two crushing wheels at y3, one block left and right of the drop spot, axles north–south. Two more at y1. Crushing wheels need a one-block gap and must spin toward each other.',
      'Behind the wheels, a column of cogwheels on each side (x1 and x3), one per layer from y1 up, plus one on the generator’s axle. At y2 the two middle cogs get their power from gearboxes behind them, linked by a shaft. Feed power into the left gearbox.',
      'Hopper under the lower gap, into a chest. Sand also brings some flint and clay balls.',
      'If cobblestone bounces off the top instead of going through, the wheels spin outward: reverse the incoming rotation.',
    ],
    tables: [
      { title: 'Speed', head: ['RPM', 'Sand per second', 'Stress'], rows: [['32', '≈ 2.3', '1,280 SU'], ['64', '≈ 4.7', '2,560 SU'], ['128', '≈ 9.5', '5,120 SU'], ['256', '≈ 19', '10,240 SU']],
        note: 'The crushers are the limit: at any speed the generator makes far more cobblestone than they can take (2.5 per second per RPM). Crushing wheels work a whole stack at once, so feeding 64 at a time is the fastest way.' },
    ],
    variants: [
      {
        id: 'gravel', label: 'Gravel only', blurb: 'One crusher pair. Gravel for netherrack.',
        tagline: 'cobble → gravel · one crusher pair',
        intro: 'Just the top half: generator, funnel and one pair of crushing wheels. Use it when you only need gravel (spouting lava on gravel makes netherrack, for blaze cakes) or as the first half of the full tower.',
        stats: [{ label: 'Output', value: '≈ 9 gravel/s', hint: 'at 128 RPM' }, { label: 'Footprint', value: '5 × 4', hint: '4 tall' }, { label: 'Stress', value: '24 SU/RPM', hint: '1,536 SU at 64 RPM' }, { label: 'Input', value: 'nothing' }],
        io: { in: [], inText: 'only rotation', out: ['minecraft:gravel'] },
        grid: {
          zs: [-2, -1, 0, 1],
          fall: [[2, 0, 2.1, 1.4, 'minecraft:cobblestone'], [2, 0, 0.6, 0.1, 'minecraft:gravel']],
          layers: [
            { y: 0, name: 'y0 · output', cap: 'Hopper under the gap, into a chest.', rows: ['Pw G S- G .', '. z+ . z- .', '. . Hs . .', '. . Co . .'] },
            { y: 1, name: 'y1 · crushers', cap: 'Crushing wheels at x1 and x3, gap at x2. The gearboxes at y0 behind turn the cog columns opposite ways.', rows: ['. . . . .', '. z- . z+ .', '. Wl . Wr .', '. . . . .'] },
            { y: 2, name: 'y2 · funnel', cap: 'Funnel facing down under the generator.', rows: ['. . . . .', '. z+ . . .', '. . Fd . .', '. . . . .'] },
            { y: 3, name: 'y3 · generator', cap: 'Generator with its back axle cog meshing into the left column.', rows: ['. . . . .', '. z- z+ . .', '. . Gn . .', '. . . . .'] },
          ],
        },
        parts: [{ label: 'Tower', items: [['createcobblestone:mechanical_generator', 1], ['create:crushing_wheel', 2], ['create:cogwheel', 6], ['create:gearbox', 2], ['create:shaft', 2], ['create:andesite_funnel', 1], ['minecraft:hopper', 1], ['minecraft:chest', 1]] }],
        steps: [
          'Generator at the top, axle north–south, funnel facing down under it.',
          'One pair of crushing wheels below, gap under the funnel.',
          'Cog columns behind the wheels, gearboxes at the bottom linked by a shaft, power into the left gearbox.',
          'Hopper and chest under the gap.',
        ],
        tables: undefined,
      },
    ],
  },

  // ======================================================= rotational power
  {
    id: 'wheels', section: 'kinetic', tier: 'Early', title: 'Large water wheels', nav: 'Water wheels', icon: 'create:large_water_wheel',
    tagline: '512 SU per wheel · no fuel',
    intro: 'Line up large water wheels on one shaft line. Each wheel adds 512 SU. Skip the small wheel: the pack cuts it to 128 SU.',
    stats: [{ label: 'Output', value: '1,536 SU', hint: '3 wheels' }, { label: 'Speed', value: '4 RPM' }, { label: 'Fuel', value: 'none' }, { label: 'Per wheel', value: '16 planks' }],
    scene: 'wheels',
    io: { in: ['fluid:water'], inText: 'flowing water', out: [], outText: '1,536 SU' },
    parts: [{ label: 'Three wheels', items: [['create:large_water_wheel', 3], ['create:shaft', 3], ['create:gearbox', 1]] }],
    steps: [
      'Put the wheels on one shaft line with a shaft between each pair. That leaves room to route the water.',
      'Water has to run along every wheel’s rim the same way: over the top, then down one side. Check with goggles after each wheel.',
      'Large wheels turn at 4 RPM. Each large→small cogwheel step doubles the speed and keeps the SU the same.',
    ],
  },
  {
    id: 'windmill', section: 'kinetic', tier: 'Early', title: '64-sail windmill', nav: 'Windmill', icon: 'create:white_sail',
    tagline: '4,096 SU · runs every production line',
    intro: 'A windmill gives 512 SU per RPM and turns 1 RPM for every 8 sails, up to 16 RPM. 64 sails give 4,096 SU, which covers the ammo line, parts ring, Metalworks and rolling mill together (≈ 2,000 SU at 32 RPM).',
    stats: [{ label: 'Output', value: '4,096 SU', hint: '8 RPM' }, { label: 'Fuel', value: 'none' }, { label: 'Space', value: '17 × 17', hint: 'in front of the tower' }, { label: 'Max', value: '8,192 SU', hint: '128 sails' }],
    scene: 'windmill',
    io: { in: [], inText: 'wind, nothing else', out: [], outText: '4,096 SU' },
    parts: [
      { label: 'Windmill', items: [['create:white_sail', 64], ['create:windmill_bearing', 1], ['create:super_glue', 1], ['minecraft:oak_log', 1]] },
      { label: 'Tower and gearing', note: 'Any solid blocks for the tower. The two cogwheel steps take it from 8 to 32 RPM.', items: [['create:shaft', 11], ['create:gearbox', 2], ['create:large_cogwheel', 2], ['create:cogwheel', 2], ['minecraft:stone', 9]] },
    ],
    steps: [
      'Put a windmill bearing on a tower, facing out. Add a hub block on its face and four arms of sails around it, each 2 wide and 8 long (64 sails). Plain wool blocks also count as sails.',
      'Super glue holds the sails and hub together. Right-click the bearing to start it: 8 RPM and 4,096 SU.',
      'The bearing outputs from its back. Run that shaft down the tower and gear up with two large→small cogwheel steps to reach 32 RPM.',
      'You need about 17 × 17 blocks of open space in front of the tower.',
    ],
  },
  {
    id: 'boiler4', section: 'kinetic', tier: 'Mid', title: 'Level 4 coal boiler', nav: 'Coal boiler', icon: 'create:steam_engine',
    tagline: '65,536 SU · 180 coal an hour',
    intro: 'Create’s steam boiler gives 16,384 SU per level. The level is the lowest of three things: heat (1 per burner on coal), tank blocks ÷ 4, and water in mB per tick ÷ 10. Each level also needs one steam engine. This is the most SU for your resources anywhere in the pack.',
    stats: [{ label: 'Output', value: '65,536 SU', hint: 'at 64 RPM' }, { label: 'Fuel', value: '180 coal/h', hint: '1 coal lasts 80 s' }, { label: 'Water', value: '40 mB/t', hint: 'one 2×2 pool' }, { label: 'Footprint', value: '≈ 9 × 5' }],
    scene: 'boiler4',
    io: { in: ['minecraft:coal', 'fluid:water'], inText: '180 coal an hour', out: [], outText: '65,536 SU' },
    parts: [
      { label: 'Boiler', items: [['create:fluid_tank', 16], ['create:blaze_burner', 4], ['create:steam_engine', 4], ['create:shaft', 6], ['create:gearbox', 2]] },
      { label: 'Water', note: 'A 2×2 pool never runs dry. The cog pair speeds the pump up to 128 RPM.', items: [['create:mechanical_pump', 1], ['create:fluid_pipe', 6], ['create:large_cogwheel', 1], ['create:cogwheel', 1], ['create:hand_crank', 1]] },
      { label: 'Fuel feed', optional: true, note: 'Or refill the burners by hand: each holds about 8 minutes of coal.', items: [['create:mechanical_arm', 1], ['minecraft:chest', 1]] },
    ],
    running: '180 coal or charcoal per hour',
    steps: [
      'Build a 2×2 fluid tank, 4 blocks tall (16 tanks), with a blaze burner under each of the 4 bottom tanks.',
      'Put 4 steam engines on one face and right-click each one with a shaft. That puts the shaft in the right spot, with a gap for the crank. Join the shafts with gearboxes.',
      'Water: a 2×2 pool and a pump at 80 RPM or faster (40 mB/t). Start the pump with a hand crank; once the boiler runs, it can drive its own pump through the cog pair.',
      'A Mechanical Arm next to the burners takes coal from a chest and feeds all four. Burners don’t take fuel from funnels, hoppers or chutes.',
      'Look at the tank with goggles to see the level and what is holding it back.',
    ],
    callouts: [{ title: 'No blaze yet?', body: 'A campfire, magma block or lava under 4 or more tank blocks makes a passive boiler: 2,048 SU with no fuel.', tone: 'info' }],
  },
  {
    id: 'boiler18', section: 'kinetic', tier: 'Late', title: 'Level 18 boiler', nav: 'Max boiler', icon: 'create:blaze_cake',
    tagline: '294,912 SU · blaze cakes',
    intro: 'A 3×3 tank, 8 tall, on 9 blaze burners fed with blaze cakes (2 heat each) reaches level 18. On coal the same build reaches level 9 (147,456 SU). It’s cheaper to build than the diesel plant, but it needs water and burner feeding.',
    stats: [{ label: 'Output', value: '294,912 SU', hint: 'at 64 RPM' }, { label: 'Fuel', value: '≈ 200 cakes/h', hint: 'one cake lasts 160 s' }, { label: 'Water', value: '180 mB/t', hint: 'two pools, two pumps' }, { label: 'Engines', value: '18' }],
    scene: 'boiler18',
    io: { in: ['create:blaze_cake', 'fluid:water'], inText: '≈ 200 cakes an hour', out: [], outText: '294,912 SU' },
    parts: [
      { label: 'Boiler', items: [['create:fluid_tank', 72], ['create:blaze_burner', 9], ['create:steam_engine', 18], ['create:shaft', 27], ['create:gearbox', 6]] },
      { label: 'Water', items: [['create:mechanical_pump', 2], ['create:fluid_pipe', 12], ['create:large_cogwheel', 2], ['create:cogwheel', 2], ['create:hand_crank', 1]] },
      { label: 'Fuel feed', items: [['create:mechanical_arm', 1], ['minecraft:chest', 1]] },
    ],
    running: '≈ 200 blaze cakes per hour',
    steps: [
      'Build a 3×3 tank, 8 tall (72 tanks), on 9 blaze burners.',
      'Put 9 engines on each of two opposite faces (3 × 3), right-click each with a shaft, and tie the six shaft rows together with gearboxes at one end.',
      'Water: 180 mB/t is more than one pump moves, so use two pools and two pumps at 128 RPM or more.',
      'Blaze cakes: compact an egg, sugar and cinder flour, then spout 250 mB of lava on it. Cinder flour comes from crushing netherrack, and the pack makes netherrack by spouting lava onto gravel.',
      'One Mechanical Arm at a corner reaches all 9 burners (5-block range).',
    ],
  },
  {
    id: 'diesel', section: 'kinetic', tier: 'Late', title: 'Diesel plant', nav: 'Diesel plant', icon: 'createdieselgenerators:huge_diesel_engine',
    tagline: '327,680 SU · 20 huge engines · oil to shaft',
    intro: 'This is the “330k” setup from videos: 20 huge diesel engines on one shaft line, 16,384 SU each. The full plant has three parts: a pumpjack on an oil chunk, two distillation towers that turn crude oil into diesel, and the engine row. It needs no water and no burner feeding for the engines, but each huge engine is expensive in this pack.',
    stats: [
      { label: 'Output', value: '327,680 SU', hint: '20 × 16,384' }, { label: 'Diesel', value: '20 mB/s', hint: '72 buckets/h' },
      { label: 'Crude oil', value: '≈ 67 mB/s', hint: '240 buckets/h' }, { label: 'Pumpjacks', value: '1', hint: '≈ 1,280 B/h at ratio 1' },
    ],
    scene: 'diesel',
    io: { in: ['fluid:crude_oil'], inText: 'pumped from an oil chunk, turned into diesel on site', out: [], outText: '327,680 SU' },
    parts: [
      { label: 'Engine row', note: 'Engines on both sides of a 10-long shaft, 2 blocks out, fed from pipes on top.', items: [['createdieselgenerators:huge_diesel_engine', 20], ['create:shaft', 11], ['create:large_cogwheel', 1], ['create:fluid_pipe', 26], ['create:mechanical_pump', 1], ['create:fluid_tank', 4]] },
      { label: 'Distillation', note: 'Two 1×1×3 towers on heated burners (6 tanks; each tank block uses up one controller), plus 4 tanks for crude and gasoline.', items: [['create:fluid_tank', 10], ['createdieselgenerators:distillation_controller', 6], ['create:blaze_burner', 2], ['create:mechanical_pump', 1], ['create:fluid_pipe', 10]] },
      { label: 'Pumpjack', note: 'Layout from the mod’s own ponder scene: a 3-tall scaffold tower, an arm of girders, a head over the hole and a crank under the far end.', items: [['createdieselgenerators:pumpjack_bearing', 2], ['createdieselgenerators:pumpjack_head', 1], ['createdieselgenerators:pumpjack_hole', 1], ['createdieselgenerators:pumpjack_crank', 1], ['create:metal_girder', 5], ['create:industrial_iron_block', 2], ['create:zinc_block', 1], ['create:andesite_scaffolding', 6], ['create:super_glue', 1], ['create:mechanical_pump', 1], ['create:fluid_pipe', 10], ['create:large_cogwheel', 2], ['create:cogwheel', 3], ['create:shaft', 1]] },
      { label: 'Well pipe', note: 'A straight column of pipes from under the hole down to bedrock. 128 covers a hole at y64; count your own depth.', items: [['create:fluid_pipe', 128]] },
      { label: 'Finding oil', optional: true, items: [['createdieselgenerators:oil_scanner', 1]] },
    ],
    running: '20 mB diesel per second; 2 burners eat ≈ 90 coal per hour',
    steps: [
      '<b>Find oil.</b> Hold the Oil Scanner and walk until it shows an oil chunk. A normal oil chunk holds roughly 4,000–9,100 buckets; some biomes have endless oil.',
      '<b>Pumpjack.</b> Put the Pumpjack Hole in the oil chunk with a straight column of fluid pipes under it down to bedrock. Build the arm like the 3D model: head over the hole, an industrial iron block, girders, a pumpjack bearing on a 3-tall scaffold tower in the middle, and a second pumpjack bearing at the far end. Wrench that second bearing, then super glue the arm.',
      'Put the Pumpjack Crank 3 blocks under the far end and drive it with rotation. A pump next to the hole pulls the crude oil out. One pumpjack gives far more crude than two towers can use.',
      '<b>Distillation.</b> Stack 3 fluid tanks on a blaze burner fed with coal (heated), and right-click the stack with 3 Distillation Controllers. Build two of these towers. Pump crude into the bottom tank; each tower turns 100 mB of it into 50 mB diesel (collects in the middle tank) and 50 mB gasoline (top tank) every 3 s.',
      'Pipe diesel from the towers into a tank, and gasoline into a separate tank. When the gasoline tank is full the towers pause, so give it room, or burn it in a few extra engines (12,288 SU each on gasoline).',
      '<b>Engines.</b> Lay a 10-long shaft. Put 10 huge diesel engines on each side, each 2 blocks from the shaft and facing it, so the crank has room. Right-click the engines with a shaft if they don’t pick it up.',
      'Run a pipe along the top of each engine row and pump diesel into it. Each engine burns 1 mB per second: 20 mB/s for the row.',
      'Output: 20 × 16,384 = 327,680 SU at 224 RPM. A turbocharger only doubles the RPM, not the SU.',
    ],
    tables: [
      { title: 'Fuel numbers', head: ['Part', 'Rate', 'Per hour'], rows: [
        ['20 huge engines', '20 mB/s diesel', '72 buckets'], ['2 towers (heated)', '67 mB/s crude in → 33 mB/s diesel + 33 mB/s gasoline', '240 B crude → 120 B diesel'],
        ['1 superheated tower', '100 mB in per 2 s → 75 + 75 mB', '≈ 135 B diesel'], ['Pumpjack', '≈ 1,280 B/h at full speed', 'one is plenty']] },
      { title: 'What one huge engine costs', head: ['Part', 'Per engine', 'For 20'], rows: [
        ['Block of Aluminum', '1', '20 (180 ingots)'], ['Engine Piston (piston + 2 steel rods + steel plate)', '9', '180'],
        ['Precision Mechanism', '9', '180'], ['Steel Plate (deployed)', '9', '180'], ['Redstone acid', '450 mB', '9,000 mB']],
        note: 'Each huge engine is three sequenced-assembly crafts (normal → modular → huge), each looping 3 times through: saw, spout 50 mB acid, deploy piston, deploy precision mechanism, deploy steel plate, press. You need your own assembly line for that: saw, spout, 3 deployers and a press on a looping belt.' },
    ],
    callouts: [
      { title: 'Cheaper middle step', body: 'Modular diesel engines stack up to 21 blocks at 8,192 SU each on diesel (172,032 SU per stack) and cost one craft less each, but give half the SU per mB of fuel.', tone: 'info' },
    ],
  },

  // ======================================================= electricity
  {
    id: 'thermo', section: 'electric', tier: 'Early', title: 'Thermoelectric row', nav: 'Thermoelectric row', icon: 'immersiveengineering:thermoelectric_generator',
    tagline: '62 FE/t per generator · no fuel',
    intro: 'A thermoelectric generator gives √(temperature difference) FE/t for every pair of opposite faces where one side is hot and the other cold (with the pack’s ×2 setting). Lava is 1300 K and water 300 K, so one pair gives 31 FE/t. Neither fluid is ever used up.',
    stats: [{ label: 'Output', value: '496 FE/t', hint: '8 generators' }, { label: 'Per generator', value: '62 FE/t', hint: '2 pairs' }, { label: 'Fuel', value: 'none' }, { label: 'Footprint', value: '17 × 3', hint: '3 tall' }],
    scene: 'thermo',
    io: { in: ['fluid:lava', 'fluid:water'], inText: 'never used up', out: [], outText: '496 FE/t' },
    grid: {
      zs: [-1, 0, 1],
      layers: [
        { y: 0, name: 'y0 · bottom', cap: 'Under each generator: the opposite of what’s above it. Stone between the fluids, glass on the sides so nothing flows.', rows: ['. Gl . Gl . Gl . Gl . Gl . Gl . Gl . Gl .', 'St Wa St Lv St Wa St Lv St Wa St Lv St Wa St Lv St', '. Gl . Gl . Gl . Gl . Gl . Gl . Gl . Gl .'] },
        { y: 1, name: 'y1 · generators', cap: 'Water, generator, lava, generator, water… Each generator sits between a hot and a cold block. LV connectors go on the north face.', rows: ['Gl Cn Gl Cn Gl Cn Gl Cn Gl Cn Gl Cn Gl Cn Gl Cn Gl', 'Wa Tg Lv Tg Wa Tg Lv Tg Wa Tg Lv Tg Wa Tg Lv Tg Wa', 'Gl . Gl . Gl . Gl . Gl . Gl . Gl . Gl . Gl'] },
        { y: 2, name: 'y2 · top', cap: 'Above each generator: hot over one, cold over the next, so each generator gets a second hot/cold pair.', rows: ['. Gl . Gl . Gl . Gl . Gl . Gl . Gl . Gl .', 'St Lv St Wa St Lv St Wa St Lv St Wa St Lv St Wa St', '. Gl . Gl . Gl . Gl . Gl . Gl . Gl . Gl .'] },
      ],
    },
    parts: [
      { label: 'Generators', items: [['immersiveengineering:thermoelectric_generator', 8], ['immersiveengineering:connector_lv', 8], ['immersiveengineering:wirecoil_copper', 2]] },
      { label: 'Hot and cold', note: 'Magma blocks and ice work too and need no glass.', items: [['fluid:lava', 12000], ['fluid:water', 13000], ['minecraft:stone', 18], ['minecraft:glass', 50]] },
    ],
    steps: [
      'Lay the middle row: water, generator, lava, generator, water, generator, lava… Each generator sits between a hot and a cold block, which gives 31 FE/t.',
      'Above and below each generator, put a hot block on one side and a cold one on the other, switching every other generator. That adds a second pair, for 62 FE/t.',
      'Put stone between the fluid blocks on the top and bottom layers, and glass on the open sides, so water and lava never touch.',
      'Put an LV connector on the north face of each generator and wire them to your machines or an IE capacitor.',
      'For 93 FE/t, add a third hot/cold pair on the north and south faces instead (then collect power from the ends).',
    ],
    callouts: [{ title: 'Other temperatures', body: 'Magma block 1300 K (like lava). Blue ice 200 K, packed ice 240, ice 260, snow 273. A uranium block counts as 2000 K: 41 FE/t per pair against water.', tone: 'info' }],
  },
  {
    id: 'altbank', section: 'electric', tier: 'Mid', title: 'Alternator bank', nav: 'Alternator bank', icon: 'createaddition:alternator',
    tagline: '1,440 FE/t · on the level 4 boiler',
    intro: 'A Crafts & Additions alternator makes 180 FE/t at 256 RPM and takes 8,192 SU to run (32 SU per RPM). A level 4 boiler’s 65,536 SU runs exactly 8 of them.',
    stats: [{ label: 'Output', value: '1,440 FE/t', hint: '8 × 180' }, { label: 'Uses', value: '65,536 SU', hint: 'whole L4 boiler' }, { label: 'Speed', value: '256 RPM' }, { label: 'Footprint', value: '9 × 3' }],
    scene: 'altbank',
    io: { in: [], inText: '65,536 SU from the coal boiler', out: [], outText: '1,440 FE/t' },
    parts: [
      { label: 'Bank', items: [['createaddition:alternator', 8], ['create:gearbox', 4], ['create:large_cogwheel', 2], ['create:cogwheel', 2], ['create:shaft', 3]] },
      { label: 'Wiring', note: 'A connector on each alternator, wired with copper spools.', items: [['createaddition:connector', 8], ['createaddition:copper_spool', 2]] },
      { label: 'Crafting setup (once)', optional: true, note: 'The alternator is a 5×5 mechanical-crafting recipe: 13 crafters in a diamond.', items: [['create:mechanical_crafter', 13]] },
    ],
    steps: [
      'Take the boiler’s 64 RPM shaft through two large→small cogwheel steps to reach 256 RPM.',
      'Run that shaft into a row of 4 gearboxes, and put an alternator on the north and south face of each one, facing the gearbox. Alternators only take rotation on one face.',
      'Put a small connector on each alternator and wire them to your machines or a Crafts & Additions accumulator. Each alternator pushes out up to 256 FE/t.',
    ],
  },
  {
    id: 'bigbank', section: 'electric', tier: 'Late', title: 'Big alternator bank', nav: 'Big alternator bank', icon: 'createaddition:alternator',
    tagline: '6,480 FE/t · on the max boiler',
    intro: 'The same idea at full scale: the level 18 boiler’s 294,912 SU runs 36 alternators. They sit on both sides of an 18-long gearbox row, 3 blocks wide.',
    stats: [{ label: 'Output', value: '6,480 FE/t', hint: '36 × 180' }, { label: 'Uses', value: '294,912 SU', hint: 'whole L18 boiler' }, { label: 'Speed', value: '256 RPM' }, { label: 'Footprint', value: '23 × 3' }],
    scene: 'bigbank',
    io: { in: [], inText: '294,912 SU from the max boiler', out: [], outText: '6,480 FE/t' },
    parts: [
      { label: 'Bank', items: [['createaddition:alternator', 36], ['create:gearbox', 18], ['create:large_cogwheel', 2], ['create:cogwheel', 2], ['create:shaft', 3]] },
      { label: 'Wiring', items: [['createaddition:connector', 36], ['createaddition:copper_spool', 8]] },
      { label: 'Crafting setup (once)', optional: true, note: 'Skip if you built it for the smaller bank.', items: [['create:mechanical_crafter', 13]] },
    ],
    steps: [
      'Bring the boiler’s shaft through two large→small cogwheel steps: 64 → 128 → 256 RPM. The SU stays the same.',
      'Run it into a straight row of 18 gearboxes.',
      'Put an alternator on the north and south face of every gearbox, facing it: 36 in total.',
      'Wire a connector on each alternator. For storage, see the accumulator note on the electricity overview.',
      'Check with goggles: the network should show 294,912 SU used of 294,912.',
    ],
  },
  {
    id: 'reactor', section: 'electric', tier: 'Late', title: 'Extreme Reactor', nav: 'Reactor', icon: 'bigreactors:reinforced_reactorcasing',
    tagline: '7×7×7 passive · 12,500 FE/t · uranium',
    intro: 'Extreme Reactors burns uranium ingots in fuel rods. In this pack only the reinforced parts exist, and every casing needs a Refined Storage machine casing, so it is a late Refined Storage project. All numbers here come from the mod’s own reactor code run with the pack’s settings, so they match what the controller screen will show once the reactor has warmed up (a few minutes).',
    mainLabel: 'Passive 7³', mainBlurb: 'Most power for the blocks. 12,500 FE/t.',
    stats: [{ label: 'Output', value: '12,500 FE/t' }, { label: 'Uranium', value: '21 ingots/h', hint: '≈ 1 every 3 min' }, { label: 'Size', value: '7 × 7 × 7' }, { label: 'Fuel rods', value: '45', hint: '9 columns of 5' }],
    scene: 'reactor',
    io: { in: ['immersiveengineering:ingot_uranium'], out: [], outText: '12,500 FE/t' },
    grid: {
      zs: [0, 1, 2, 3, 4, 5, 6],
      layers: [
        { y: 0, name: 'y0 · floor', cap: 'A solid floor of reinforced casings.', rows: Array(7).fill('Rc Rc Rc Rc Rc Rc Rc') },
        { y: 1, name: 'y1 · core', cap: 'Fuel rods every other block (a 3×3 grid of columns), water source blocks everywhere else inside.', rows: ['Rc Rc Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc Rc Rc'], to: 1 },
        { y: 2, name: 'y2 · core + fuel in', cap: 'Same core. The access port on the west wall takes uranium in.', rows: ['Rc Rc Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Ra Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc Rc Rc'] },
        { y: 3, name: 'y3 · core + controller', cap: 'Controller in the middle of the south wall, active power port in the middle of the east wall.', rows: ['Rc Rc Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rt', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Rc Rc Rk Rc Rc Rc'] },
        { y: 4, name: 'y4 · core + waste out', cap: 'The second access port, set to output, gives back the waste.', rows: ['Rc Rc Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Ra Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc Rc Rc'] },
        { y: 5, name: 'y5 · core', cap: 'Last core layer. Every fuel-rod column must run from the floor to the roof.', rows: ['Rc Rc Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Wa Wa Wa Wa Wa Rc', 'Rc Rf Wa Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc Rc Rc'] },
        { y: 6, name: 'y6 · roof', cap: 'A control rod on top of every fuel-rod column, casings everywhere else.', rows: ['Rc Rc Rc Rc Rc Rc Rc', 'Rc Rr Rc Rr Rc Rr Rc', 'Rc Rc Rc Rc Rc Rc Rc', 'Rc Rr Rc Rr Rc Rr Rc', 'Rc Rc Rc Rc Rc Rc Rc', 'Rc Rr Rc Rr Rc Rr Rc', 'Rc Rc Rc Rc Rc Rc Rc'] },
      ],
    },
    parts: [
      { label: 'Shell', note: 'The 7×7×7 shell is 218 blocks: 205 casings plus the parts below. Glass walls are allowed but each glass block also costs a casing.', items: [['bigreactors:reinforced_reactorcasing', 205], ['bigreactors:reinforced_reactorcontroller', 1], ['bigreactors:reinforced_reactorpowertapfe_active', 1], ['bigreactors:reinforced_reactorsolidaccessport', 2]] },
      { label: 'Core', items: [['bigreactors:reinforced_reactorfuelrod', 45], ['bigreactors:reinforced_reactorcontrolrod', 9], ['fluid:water', 80000]] },
    ],
    stock: { items: [['immersiveengineering:ingot_uranium', 64]], note: 'The rods hold 180 ingots when full (4 each). After that it burns about 21 ingots an hour. A hopper or chest on the input access port keeps it fed.' },
    steps: [
      'Build the 7×7 floor from reinforced casings.',
      'Layers y1–y5: casings around the edge. Inside, fuel rods on every other block both ways (9 columns: the four corners, the middle of each side and the centre) and water source blocks in the other 16 spots.',
      'Put the controller, the active power port and the two access ports into the walls as on the layers. None of them may sit on an edge or a corner of the shell.',
      'Roof: a control rod on top of each of the 9 fuel-rod columns, casings everywhere else.',
      'Right-click the controller. Until the structure is right it tells you what is wrong and where.',
      'Put uranium into the west access port (set to input). Set the upper one to output: waste (cyanite) comes out there. Put a chest under it or pipe it away.',
      'Touch the active power port with a wire connector or cable. It pushes power out by itself; a passive port would need a cable that pulls.',
      'Turn it on. It takes a few minutes to heat up to its full 12,500 FE/t (fuel at about 1,850 °C).',
    ],
    tables: [
      { title: 'All three versions', head: ['Version', 'Size', 'Fuel rods', 'Output', 'Uranium', 'Casing blocks'], rows: [
        ['Starter (passive)', '5 × 5 × 5', '12 (4 columns)', '3,600 FE/t', '6.6 ingots/h', '90 + parts'],
        ['Passive 7³', '7 × 7 × 7', '45 (9 columns)', '12,500 FE/t', '21 ingots/h', '205 + parts'],
        ['Steam + turbine', '5³ reactor + 5 × 5 × 21 turbine', '12 (4 columns)', '14,400 FE/t', '5.7 ingots/h', '88 reactor + 349 turbine']],
        note: 'Bigger reactors give more power per casing; the turbine version gets the most out of each uranium ingot (about 4× the passive ones) but costs the most blocks. Simulated with the mod’s code at 0% control-rod insertion and the pack’s settings (all multipliers 1.0).' },
      { title: 'The rules the controller checks', head: ['Rule', 'What it means'], rows: [
        ['Frame', 'Edges and corners of the box must be plain casings. Ports, the controller and taps go on the faces.'],
        ['Fuel rods', 'Vertical columns from floor to roof, with a control rod on top of each column, all on the same side (the roof).'],
        ['One controller, one power system', 'Exactly one controller. Use power ports or fluid ports, never both.'],
        ['Inside', 'Fuel rods plus air, water or any moderator block. Water is free and gives a little more than air.'],
        ['Size', 'Up to 25 × 25 × 25 in this pack.']] },
    ],
    callouts: [
      { title: 'This is expensive', body: 'Every casing is 4 steel plates, 4 lead plates and an RS machine casing (4 aluminum plates + 4 duroplast plates). The controller, ports and power port also eat 4 casings each. The material list shows the full bill. Start with the 5×5×5 version: it already makes 3,600 FE/t, and its core is the same one the turbine version uses later.', tone: 'warn' },
    ],
    variants: [
      {
        id: 'starter', label: 'Starter', blurb: '5×5×5 passive. 3,600 FE/t.',
        tagline: '5×5×5 passive · 3,600 FE/t',
        intro: 'The cheapest reactor worth building: four fuel-rod columns in the corners of a 3×3 core. It makes 3,600 FE/t on 6.6 uranium ingots an hour. Later you can turn this exact reactor into the steam version by swapping its power port for fluid ports and adding a turbine.',
        stats: [{ label: 'Output', value: '3,600 FE/t' }, { label: 'Uranium', value: '6.6 ingots/h' }, { label: 'Size', value: '5 × 5 × 5' }, { label: 'Fuel rods', value: '12', hint: '4 columns of 3' }],
        io: { in: ['immersiveengineering:ingot_uranium'], out: [], outText: '3,600 FE/t' },
        grid: {
          zs: [0, 1, 2, 3, 4],
          layers: [
            { y: 0, name: 'y0 · floor', cap: 'Solid floor of reinforced casings.', rows: Array(5).fill('Rc Rc Rc Rc Rc') },
            { y: 1, name: 'y1 · core + fuel in', cap: 'Fuel rods in the four inner corners, water in the other 5 spots. Input access port on the west wall.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Rc', 'Ra Wa Wa Wa Rc', 'Rc Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc'] },
            { y: 2, name: 'y2 · core + controller', cap: 'Controller on the south wall, active power port on the east wall.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Rc', 'Rc Wa Wa Wa Rt', 'Rc Rf Wa Rf Rc', 'Rc Rc Rk Rc Rc'] },
            { y: 3, name: 'y3 · core + waste out', cap: 'Output access port for the waste.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Rc', 'Ra Wa Wa Wa Rc', 'Rc Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc'] },
            { y: 4, name: 'y4 · roof', cap: 'A control rod on each of the 4 columns.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rr Rc Rr Rc', 'Rc Rc Rc Rc Rc', 'Rc Rr Rc Rr Rc', 'Rc Rc Rc Rc Rc'] },
          ],
        },
        parts: [
          { label: 'Shell', note: '98 shell blocks: 90 casings plus the parts below.', items: [['bigreactors:reinforced_reactorcasing', 90], ['bigreactors:reinforced_reactorcontroller', 1], ['bigreactors:reinforced_reactorpowertapfe_active', 1], ['bigreactors:reinforced_reactorsolidaccessport', 2]] },
          { label: 'Core', items: [['bigreactors:reinforced_reactorfuelrod', 12], ['bigreactors:reinforced_reactorcontrolrod', 4], ['fluid:water', 15000]] },
        ],
        stock: { items: [['immersiveengineering:ingot_uranium', 64]], note: '48 ingots fill the rods, then about 6.6 an hour.' },
        steps: [
          'Build the 5×5 casing floor.',
          'Layers y1–y3: casings around the edge, fuel rods in the four inner corners, water source blocks in the other 5 inside spots.',
          'Controller, active power port and the two access ports go into the wall faces as on the layers, never on edges.',
          'Roof: control rods on the 4 columns, casings elsewhere.',
          'Fill the input access port with uranium, set the other one to output, wire up the power port and turn it on.',
        ],
        tables: undefined,
      },
      {
        id: 'turbine', label: 'Steam + turbine', blurb: 'Same 5³ core, 14,400 FE/t on a quarter of the fuel.',
        tagline: 'active 5³ reactor + 5×5×21 turbine · 14,400 FE/t',
        intro: 'The starter reactor in active mode: instead of a power port it boils water into steam (2,000 mB/t), and a turbine standing right against it turns the steam into power. It makes four times the power of the same reactor on passive and uses less uranium than the passive 7³. The cost is the turbine: a tall 5×5 tower full of casings, plus 48 blocks of electrum for its coil.',
        stats: [{ label: 'Output', value: '14,400 FE/t', hint: 'at ≈ 1,800 RPM' }, { label: 'Uranium', value: '5.7 ingots/h' }, { label: 'Steam', value: '2,000 mB/t' }, { label: 'Make-up water', value: '≈ 350 mB/t', hint: '3 pumps at 256 RPM' }],
        io: { in: ['immersiveengineering:ingot_uranium', 'fluid:water'], inText: '5.7 ingots an hour, 350 mB/t water', out: [], outText: '14,400 FE/t' },
        grid: {
          zs: [0, 1, 2, 3, 4],
          layers: [
            { y: 0, name: 'y0 · floors', cap: 'Reactor floor (x0–x4) and turbine floor (x5–x9). The rotor bearing sits in the middle of the turbine floor.', rows: ['Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc', 'Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc', 'Rc Rc Rc Rc Rc Tc Tc Tb Tc Tc', 'Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc', 'Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc'] },
            { y: 1, name: 'y1 · cores', cap: 'Reactor: the same core as the starter, fuel in on the west wall. Turbine: the rotor shaft in the middle with a blade on each side; the turbine controller is on its south wall.', rows: ['Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc', 'Rc Rf Wa Rf Rc Tc . Tl . Tc', 'Ra Wa Wa Wa Rc Tc Tl Ts Tl Tc', 'Rc Rf Wa Rf Rc Tc . Tl . Tc', 'Rc Rc Rk Rc Rc Tc Tc Tk Tc Tc'] },
            { y: 2, name: 'y2 · ports', cap: 'The fluid ports meet face to face: reactor steam out (z1) into the turbine’s steam in, turbine water out (z3) into the reactor’s water in. A third reactor port on the north wall takes make-up water. The turbine’s power port is on its east wall.', rows: ['Rc Rc Rw Rc Rc Tc Tc Tc Tc Tc', 'Rc Rf Wa Rf Rp Tp . Tl . Tc', 'Rc Wa Wa Wa Rc Tc Tl Ts Tl Tt', 'Rc Rf Wa Rf Rp Tp . Tl . Tc', 'Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc'] },
            { y: 3, name: 'y3 · cores', cap: 'Reactor waste out on the west wall. Turbine: blades again.', rows: ['Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc', 'Rc Rf Wa Rf Rc Tc . Tl . Tc', 'Ra Wa Wa Wa Rc Tc Tl Ts Tl Tc', 'Rc Rf Wa Rf Rc Tc . Tl . Tc', 'Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc'] },
            { y: 4, name: 'y4 · reactor roof', cap: 'Control rods on the reactor’s 4 columns. The turbine keeps going up.', rows: ['Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc', 'Rc Rr Rc Rr Rc Tc . Tl . Tc', 'Rc Rc Rc Rc Rc Tc Tl Ts Tl Tc', 'Rc Rr Rc Rr Rc Tc . Tl . Tc', 'Rc Rc Rc Rc Rc Tc Tc Tc Tc Tc'] },
            { y: 5, to: 13, name: 'y5–y13 · blades', cap: 'Nine more blade layers (13 in all, 52 blades): shaft in the middle, one blade on each side, corners empty.', rows: ['. . . . . Tc Tc Tc Tc Tc', '. . . . . Tc . Tl . Tc', '. . . . . Tc Tl Ts Tl Tc', '. . . . . Tc . Tl . Tc', '. . . . . Tc Tc Tc Tc Tc'] },
            { y: 14, to: 19, name: 'y14–y19 · coil', cap: 'Six layers of electrum blocks around the shaft (48 blocks). Coils must sit above all the blades, only in the ring right around the shaft.', rows: ['. . . . . Tc Tc Tc Tc Tc', '. . . . . Tc Te Te Te Tc', '. . . . . Tc Te Ts Te Tc', '. . . . . Tc Te Te Te Tc', '. . . . . Tc Tc Tc Tc Tc'] },
            { y: 20, name: 'y20 · turbine roof', cap: 'Casings. The rotor shaft must end right under this roof.', rows: ['. . . . . Tc Tc Tc Tc Tc', '. . . . . Tc Tc Tc Tc Tc', '. . . . . Tc Tc Tc Tc Tc', '. . . . . Tc Tc Tc Tc Tc', '. . . . . Tc Tc Tc Tc Tc'] },
          ],
        },
        parts: [
          { label: 'Reactor shell', note: '98 shell blocks: 88 casings plus the parts below. The same as the starter, with three fluid ports instead of the power port.', items: [['bigreactors:reinforced_reactorcasing', 88], ['bigreactors:reinforced_reactorcontroller', 1], ['bigreactors:reinforced_reactorfluidport_forge_active', 3], ['bigreactors:reinforced_reactorsolidaccessport', 2]] },
          { label: 'Reactor core', items: [['bigreactors:reinforced_reactorfuelrod', 12], ['bigreactors:reinforced_reactorcontrolrod', 4], ['fluid:water', 15000]] },
          { label: 'Turbine shell', note: '354 shell blocks: 349 casings plus the parts below.', items: [['bigreactors:reinforced_turbinecasing', 349], ['bigreactors:reinforced_turbinecontroller', 1], ['bigreactors:reinforced_turbinerotorbearing', 1], ['bigreactors:reinforced_turbinefluidport_forge_active', 2], ['bigreactors:reinforced_turbinepowertapfe_active', 1]] },
          { label: 'Rotor and coil', items: [['bigreactors:reinforced_turbinerotorshaft', 19], ['bigreactors:reinforced_turbinerotorblade', 52], ['immersiveengineering:storage_electrum', 48]] },
          { label: 'Make-up water', note: 'The reactor turns 1 mB of water into 0.85 mB of steam, so the loop loses about 350 mB/t. Three pumps at 256 RPM from a 2×2 pool cover it.', items: [['create:mechanical_pump', 3], ['create:fluid_pipe', 12]] },
        ],
        stock: { items: [['immersiveengineering:ingot_uranium', 64]], note: '48 ingots fill the rods, then about 5.7 an hour.' },
        steps: [
          'Build the starter reactor, but leave out the power port: put active fluid ports in the east wall at z1 and z3 (y2), and a third one in the north wall.',
          'Build the turbine right against the reactor’s east wall: a 5×5 tower, 21 tall. Its two fluid ports go in its west wall touching the reactor’s ports, so the fluid moves port to port without pipes.',
          'Rotor: the bearing in the middle of the turbine floor, then rotor shafts straight up to the roof (19). Blades on the 4 sides of the lowest 13 shafts, 52 in all.',
          'Coil: on the top 6 shaft layers, fill the 8 blocks around the shaft with electrum blocks. Coils have to be above all the blades.',
          'Open each port and set its direction: reactor port z1 = output (steam), turbine port z1 = input; turbine port z3 = output (water), reactor port z3 = input. The north reactor port is an input for make-up water.',
          'Pump water into the north port: three mechanical pumps at 256 RPM from a 2×2 pool. Fill the loop before starting.',
          'Turn on the reactor, then the turbine. In the turbine screen set the steam intake to 2,000 mB/t and switch the coils (inductor) on once it passes about 1,700 RPM. It settles near 1,800 RPM and makes about 14,400 FE/t through its power port.',
        ],
        tables: [
          { title: 'Turbine coil choices', head: ['Coil (blocks around the shaft)', 'Layers', 'Output', 'Turbine height'], rows: [
            ['Electrum (best you can make here)', '6 × 8 = 48', '14,400 FE/t at 1,825 RPM', '21'],
            ['Gold', '7 × 8 = 56', '11,600 FE/t at 1,790 RPM', '22']],
            note: 'The coil count sets the speed. Too few coils and the rotor runs past 2,000 RPM; too many and it sits around 900 RPM, which is also fine but wastes coil.' },
        ],
      },
    ],
  },
]

export const BUILD: Record<string, Build> = Object.fromEntries(BUILDS.map((b) => [b.id, b]))

/** all parts of a build (optionally including optional groups) */
export function buildParts(b: Build, withOptional = true) {
  const m = new Map<string, number>()
  for (const g of b.parts) if (withOptional || !g.optional) for (const [id, q] of g.items) m.set(id, (m.get(id) || 0) + q)
  return [...m.entries()] as Stack[]
}
