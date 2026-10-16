import type { Stack } from './recipes'

export interface PartGroup { label: string; items: Stack[]; note?: string; optional?: boolean }
export interface Stat { label: string; value: string; hint?: string }
export interface Table { title?: string; head: string[]; rows: string[][]; note?: string; highlight?: number[] }
export interface Layer { y: number; name: string; cap: string; rows: string[] }
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
  grid?: { zs: number[]; layers: Layer[]; path?: number[][]; loop?: boolean; item?: string }
  parts: PartGroup[]
  stock?: { items: Stack[]; note: string }
  running?: string
  steps: string[]
  tables?: Table[]
  callouts?: { title: string; body: string; tone?: 'info' | 'warn' | 'ok' }[]
}

export const BUILDS: Build[] = [
  // ======================================================= production
  {
    id: 'ammo', section: 'production', title: 'Ammo line', nav: 'Ammo line', icon: 'tacz:ammo',
    tagline: '3 deployers · 7 × 2 · 15 round types',
    intro: 'A 5-block belt with three deployers. Casings go into the input chest and finished rounds land in the output chest. All 12 standard calibers use the same two steps (a gunpowder pinch, then a lead nugget), so you switch caliber just by feeding a different casing. Calibers can be mixed in one chest.',
    stats: [
      { label: 'Deployers', value: '3' }, { label: 'Footprint', value: '7 × 2', hint: '4 tall' },
      { label: 'Stress', value: '12 SU/RPM', hint: '384 SU at 32 RPM' }, { label: 'Speed', value: '≈ 1 round/s', hint: 'at 64 RPM' },
    ],
    scene: 'ammo',
    io: { in: ['deceasedcraft:bullet_casing_9mm_round', 'createbigcannons:gunpowder_pinch', 'immersiveengineering:nugget_lead'], out: ['tacz:ammo'], outText: 'any of 15 calibers' },
    grid: {
      zs: [0, 1], path: [[1, 0], [5, 0]], loop: false, item: 'casing',
      layers: [
        { y: 0, name: 'y0 · belt', cap: 'Belt level. Input chest at x0, output chest at x6. The first gearbox sits right behind the belt’s first pulley.', rows: ['Ci B>*i B> B> B> B>*o Co', '. G . . . . .'] },
        { y: 1, name: 'y1 · gap', cap: 'Keep the space above x2–x4 clear: the deployer hands reach through it. A vertical shaft rises behind x1.', rows: ['. . ~ ~ ~ . .', '. So . . . . .'] },
        { y: 2, name: 'y2 · deployers', cap: 'D1–D3 face down. The front gearbox at x1 passes the tower’s rotation along the deployer row.', rows: ['. G D1 D2 D3 . .', '. G . . . . .'] },
        { y: 3, name: 'y3 · feed + power', cap: 'Hoppers on the deployers (chests can go on y4). Power comes into the tower at x1 from above.', rows: ['. . H H H . .', '. Pw . . . . .'] },
      ],
    },
    parts: [
      { label: 'Line', items: [['create:deployer', 3], ['create:belt_connector', 1], ['create:shaft', 3], ['create:gearbox', 3], ['minecraft:hopper', 3], ['minecraft:chest', 2], ['create:andesite_funnel', 2]] },
      { label: 'Casings (once)', optional: true, note: 'The IE Metal Press multiblock and a mold for each caliber you want. Build the press from the IE manual.', items: [['deceasedcraft:mold_bullet_casing_9mm', 1]] },
    ],
    stock: { items: [['createbigcannons:gunpowder_pinch', 64], ['immersiveengineering:nugget_lead', 64], ['immersiveengineering:storage_lead', 1]], note: 'Per 64 rounds. D3 keeps one Block of Lead so the line never jams on an empty hand; only 37mm shells use it.' },
    steps: [
      'Lay a 5-long belt from x1 to x5. Put the input chest at x0, then place an andesite funnel on its face so it sits on the belt. Placed normally, a funnel <b>pulls</b> from the chest.',
      'Put the output chest at x6 and <b>sneak-place</b> its funnel so it inserts. A wrench flips a funnel between pulling and inserting.',
      'Put deployers D1–D3 on y2 above x2–x4, facing down. Their shaft ends must point east–west so they pass rotation along the row. Wrench them if they don’t.',
      'Build the power tower behind x1: gearbox (y0), vertical shaft (y1), gearbox (y2), then a gearbox in front of D1. Feed power in from above.',
      'Check the belt runs from x1 toward x5. If it runs backwards, put one more gearbox in the incoming shaft (straight through a gearbox reverses rotation).',
      'Add a hopper on each deployer, and a chest on top of each hopper if you want long runs between refills.',
    ],
    tables: [
      { title: 'Stations', head: ['Station', 'Keep in it', 'Used by'], rows: [['D1', 'Gunpowder Pinch', 'all 12 standard calibers'], ['D2', 'Lead Nugget', 'all 12 standard calibers'], ['D3', 'Block of Lead', 'only 37mm, but it stays loaded so the line never stops']] },
      { title: 'Heavy rounds', head: ['Round', 'D1', 'D2', 'Casings per brass'], rows: [['.50 BMG', 'Gunpowder', 'Lead Ingot', '2 per ingot'], ['40mm', 'Gunpowder', 'TNT', '1 per ingot'], ['37mm APHE', 'Gunpowder Sack', 'TNT', '2 per brass block']], note: 'For heavy rounds, swap D1 and D2 for one batch, then swap back. Standard calibers: 9mm, .45 ACP, .357, .50 AE, 12g, 5.56, 5.7, 7.62×39, .30-06, .308, 7.62×54 and .338, each 4 casings per brass ingot from the IE Metal Press.' },
    ],
    callouts: [{ title: 'Every deployer must hold something', body: 'An item waits forever under a deployer with an empty hand. Keep all three stocked, or put a lever on a deployer to switch it off.', tone: 'warn' }],
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
    stock: { items: [['deceasedcraft:blueprint', 1], ['immersiveengineering:stick_steel', 16], ['immersiveengineering:plate_steel', 16], ['createbigcannons:recoil_spring', 16], ['immersiveengineering:component_steel', 16], ['minecraft:iron_ingot', 16]], note: 'For 4 pistol kits: S1 holds the blueprint (kept), S2–S6 get 4 of their item per kit.' },
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
        { y: 2, name: 'y2 · presses', cap: 'Three presses with their shafts along the row, powered from the gearbox at x8.', rows: ['. . . . . P P P G .', '. . . . . . . . G .'] },
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
    intro: 'A windmill gives 512 SU per RPM and turns 1 RPM for every 8 sails, up to 16 RPM. 64 sails give 4,096 SU, which covers the ammo line, parts ring, Metalworks and rolling mill together (≈ 2,200 SU at 32 RPM).',
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
    tagline: '5×5×5 passive · uranium',
    intro: 'In this pack only the reinforced reactor parts can be crafted, and their casing needs a Refined Storage machine casing, so the reactor is a late Refined Storage project. This 5×5×5 passive design is the smallest sensible one: 15 fuel rods in 5 columns with water as moderator. Its output depends on fuel and control-rod settings, and the controller screen shows it.',
    stats: [{ label: 'Size', value: '5 × 5 × 5' }, { label: 'Fuel rods', value: '15', hint: '5 columns' }, { label: 'Casings', value: '89' }, { label: 'Output', value: 'see controller', hint: 'depends on settings' }],
    scene: 'reactor',
    io: { in: ['immersiveengineering:ingot_uranium'], out: [], outText: 'electricity (FE)' },
    grid: {
      zs: [0, 1, 2, 3, 4],
      layers: [
        { y: 0, name: 'y0 · floor', cap: 'Solid floor of reinforced casings.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rc Rc Rc Rc', 'Rc Rc Rc Rc Rc', 'Rc Rc Rc Rc Rc', 'Rc Rc Rc Rc Rc'] },
        { y: 1, name: 'y1 · core', cap: 'Fuel rods in the centre and the four inner corners, water in between. The controller and the power port sit on the walls.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Rc', 'Ra Wa Rf Wa Rt', 'Rc Rf Wa Rf Rc', 'Rc Rc Rk Rc Rc'] },
        { y: 2, name: 'y2 · core', cap: 'Same pattern. Access port 2 is for waste out.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Rc', 'Ra Wa Rf Wa Rc', 'Rc Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc'] },
        { y: 3, name: 'y3 · core', cap: 'Same pattern. Fuel rod columns must run the full height of the inside.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rf Wa Rf Rc', 'Rc Wa Rf Wa Rc', 'Rc Rf Wa Rf Rc', 'Rc Rc Rc Rc Rc'] },
        { y: 4, name: 'y4 · roof', cap: 'A control rod on top of every fuel-rod column, casings elsewhere.', rows: ['Rc Rc Rc Rc Rc', 'Rc Rr Rc Rr Rc', 'Rc Rc Rr Rc Rc', 'Rc Rr Rc Rr Rc', 'Rc Rc Rc Rc Rc'] },
      ],
    },
    parts: [
      { label: 'Shell', items: [['bigreactors:reinforced_reactorcasing', 89], ['bigreactors:reinforced_reactorcontroller', 1], ['bigreactors:reinforced_reactorpowertapfe_passive', 1], ['bigreactors:reinforced_reactorsolidaccessport', 2]] },
      { label: 'Core', items: [['bigreactors:reinforced_reactorfuelrod', 15], ['bigreactors:reinforced_reactorcontrolrod', 5], ['fluid:water', 12000]] },
    ],
    stock: { items: [['immersiveengineering:ingot_uranium', 64]], note: 'Fuel goes into the input access port. Waste (cyanite) comes out of the second one, set to output.' },
    steps: [
      'Build the 5×5 floor from reinforced casings.',
      'Layers y1–y3: casings around the edge, fuel rods in the centre and the four inner corners, water source blocks in the other 4 spots. Put the controller, the power port and the two access ports into the walls (not on edges or corners).',
      'Roof: a control rod above each of the 5 fuel-rod columns, casings everywhere else.',
      'Right-click the controller. It tells you what’s missing until the structure is valid.',
      'Put uranium ingots into one access port, set the other to output, and wire the power port to your network. Use the control rods to trade output for fuel use.',
    ],
    callouts: [
      { title: 'This is expensive', body: 'Every casing is 4 steel plates, 4 lead plates and an RS machine casing (4 aluminum plates + 4 duroplast plates). The material list below shows the full bill. A 3×3×3 reactor (1 fuel rod) needs only 22 casings if you just want to try it.', tone: 'warn' },
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
