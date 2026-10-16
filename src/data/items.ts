import type { IconSpec, Shape } from '../lib/icons'

export interface Item {
  id: string
  name: string
  mod: string
  icon: IconSpec
  /** fluids are counted in mB */
  fluid?: boolean
  /** always treated as a raw resource (never expanded) */
  raw?: boolean
  /** alloy/processed metal that the "base metals" switch may expand */
  alloy?: boolean
  /** short hint shown for raw resources: where to get it */
  source?: string
  /** texture path override for the optional real icons (namespace/path) */
  tex?: string
}

const MODS: Record<string, string> = {
  minecraft: 'Minecraft', create: 'Create', immersiveengineering: 'Immersive Engineering',
  createaddition: 'Crafts & Additions', createdieselgenerators: 'Create Diesel Generators',
  createbigcannons: 'Create Big Cannons', bigreactors: 'Extreme Reactors', refinedstorage: 'Refined Storage',
  deceasedcraft: 'DeceasedCraft', apocalypsenow: 'Apocalypse Now', tacz: 'Timeless & Classics Zero', quark: 'Quark',
}

// colour palette
export const C = {
  iron: '#c9ced3', steel: '#8a929c', copper: '#d8814f', gold: '#f2cb4c', brass: '#d9a843', zinc: '#a9c4bb',
  lead: '#7a7c9a', alu: '#d9e1e8', nickel: '#cfcba3', constantan: '#cf9466', electrum: '#ecd66e', uranium: '#78c850',
  andesite: '#a0a7a2', wood: '#b2875a', dark: '#4a4f57', treated: '#7a5434', red: '#d6403a', green: '#59b85c',
  white: '#ecebe4', paper: '#efe9d8', glass: '#bfe3ee', slime: '#7ed36b', kelp: '#4f6b3a', stone: '#8f8f8c',
  black: '#2e3033', blaze: '#f0a23a', blue: '#4a8fd8', plastic: '#e9e3cf', silicon: '#6e7686', purple: '#9b6cd1',
  oil: '#2a2622', diesel: '#d9b44a', gasoline: '#e3d26b', lava: '#f07a22', water: '#3f86d8', acid: '#c43b3b', creosote: '#5c4422',
}

export const ITEMS: Record<string, Item> = {}

function add(id: string, name: string, shape: Shape, c: string, c2?: string, extra: Partial<Item> = {}) {
  const ns = id.split(':')[0]
  ITEMS[id] = { id, name, mod: MODS[ns] || ns, icon: { shape, c, c2 }, ...extra }
}
const raw = (source: string, more: Partial<Item> = {}): Partial<Item> => ({ raw: true, source, ...more })
const fluid = (source?: string, more: Partial<Item> = {}): Partial<Item> => ({ fluid: true, raw: !!source, source, ...more })

// ---------- raw resources ----------
add('minecraft:iron_ingot', 'Iron Ingot', 'ingot', C.iron, undefined, raw('Smelt raw iron'))
add('minecraft:copper_ingot', 'Copper Ingot', 'ingot', C.copper, undefined, raw('Smelt raw copper'))
add('minecraft:gold_ingot', 'Gold Ingot', 'ingot', C.gold, undefined, raw('Smelt raw gold'))
add('create:zinc_ingot', 'Zinc Ingot', 'ingot', C.zinc, undefined, raw('Smelt raw zinc'))
add('immersiveengineering:ingot_lead', 'Lead Ingot', 'ingot', C.lead, undefined, raw('Smelt raw lead'))
add('immersiveengineering:ingot_nickel', 'Nickel Ingot', 'ingot', C.nickel, undefined, raw('Smelt raw nickel'))
add('immersiveengineering:ingot_aluminum', 'Aluminum Ingot', 'ingot', C.alu, undefined, raw('Smelt raw aluminum, or cans in a furnace'))
add('immersiveengineering:ingot_silver', 'Silver Ingot', 'ingot', '#dfe6ee', undefined, raw('Smelt raw silver'))
add('immersiveengineering:ingot_uranium', 'Uranium Ingot', 'ingot', C.uranium, undefined, raw('Smelt raw uranium'))
add('immersiveengineering:ingot_hop_graphite', 'HOP Graphite Ingot', 'ingot', C.black, undefined, raw('IE: squeeze coal coke dust in a Squeezer, see JEI'))
add('minecraft:andesite', 'Andesite', 'stone', C.andesite, undefined, raw('Mine it, or crush cobblestone'))
add('minecraft:cobblestone', 'Cobblestone', 'stone', '#7d7d7a', undefined, raw('Mine stone'))
add('minecraft:stone', 'Stone', 'stone', C.stone, undefined, raw('Smelt cobblestone'))
add('minecraft:oak_planks', 'Planks (any wood)', 'planks', C.wood, undefined, raw('1 log = 4 planks', { tex: 'minecraft/oak_planks' }))
add('minecraft:stripped_oak_log', 'Stripped Log (any)', 'log', '#c49a5f', '#a37845', raw('Right-click a log with an axe'))
add('minecraft:oak_log', 'Log (any)', 'log', '#7a5a36', '#b2875a', raw('Chop trees'))
add('minecraft:white_wool', 'Wool', 'wool', C.white, undefined, raw('Sheep, or 4 string'))
add('minecraft:slime_ball', 'Slimeball', 'gem', C.slime, undefined, raw('Slimes'))
add('minecraft:paper', 'Paper', 'plate', C.paper, undefined, raw('3 sugar cane = 3 paper'))
add('minecraft:glass', 'Glass', 'glass', C.glass, undefined, raw('Smelt sand'))
add('minecraft:redstone', 'Redstone Dust', 'dust', C.red, undefined, raw('Mine redstone ore'))
add('minecraft:quartz', 'Nether Quartz', 'gem', '#ece6dc', undefined, raw('Nether, or loot'))
add('minecraft:coal', 'Coal', 'gem', C.black, undefined, raw('Mine coal ore'))
add('minecraft:dried_kelp', 'Dried Kelp', 'kelp', C.kelp, undefined, raw('Smelt kelp'))
add('minecraft:gunpowder', 'Gunpowder', 'dust', '#6b6b6b', undefined, raw('Creepers, or wash crushed zinc'))
add('minecraft:netherrack', 'Netherrack', 'stone', '#8a3b36', undefined, raw('Nether, or spout lava onto gravel (pack recipe)'))
add('minecraft:terracotta', 'Terracotta', 'block', '#a5624a', undefined, raw('Smelt clay blocks'))
add('minecraft:tnt', 'TNT', 'block', C.red, C.white, raw('5 gunpowder + 4 sand'))
add('minecraft:netherite_scrap', 'Netherite Scrap', 'ingot', '#5a4440', undefined, raw('Ancient debris'))
add('minecraft:blaze', 'Blaze', 'mob', C.blaze, undefined, raw('Capture one with an Empty Blaze Burner', { tex: 'minecraft/blaze_powder' }))
add('minecraft:sugar', 'Sugar', 'dust', '#f4f4f4', undefined, raw('Sugar cane'))
add('minecraft:egg', 'Egg', 'nugget', '#efe2c4', undefined, raw('Chickens'))
add('immersiveengineering:coal_coke', 'Coal Coke', 'gem', '#3a3a3e', undefined, raw('IE Coke Oven: 1 coal → 1 coke + 500 mB creosote'))
add('deceasedcraft:silica_dust', 'Silica Dust', 'dust', '#e4e0d4', undefined, raw('IE Crusher: 1 quartz → 4 silica dust'))
add('refinedstorage:silicon', 'Silicon', 'gem', C.silicon, undefined, raw('IE Arc Furnace: silica dust + coal coke → 2 silicon'))
add('immersiveengineering:plate_duroplast', 'Duroplast Plate', 'plate', C.plastic, undefined, raw('IE Bottling Machine: plate mold + 250 mB phenolic resin (from the IE Refinery)', { tex: 'immersiveengineering/plate_duroplast' }))

// fluids
add('fluid:water', 'Water', 'bucket', C.water, undefined, fluid('Infinite: a 2×2 pool', { tex: 'minecraft/water_bucket' }))
add('fluid:lava', 'Lava', 'bucket', C.lava, undefined, fluid('Lava lakes, or a superheated mixer melting cobblestone', { tex: 'minecraft/lava_bucket' }))
add('fluid:creosote', 'Creosote Oil', 'bucket', C.creosote, undefined, fluid('IE Coke Oven: 500 mB per coal', { tex: 'immersiveengineering/creosote_bucket' }))
add('fluid:redstone_acid', 'Redstone Acid', 'bucket', C.acid, undefined, fluid(undefined, { tex: 'immersiveengineering/redstone_acid_bucket' }))
add('fluid:crude_oil', 'Crude Oil', 'bucket', C.oil, undefined, fluid('Pumpjack on an oil chunk', { tex: 'createdieselgenerators/crude_oil_bucket' }))
add('fluid:diesel', 'Diesel', 'bucket', C.diesel, undefined, fluid(undefined, { tex: 'createdieselgenerators/diesel_bucket' }))
add('fluid:gasoline', 'Gasoline', 'bucket', C.gasoline, undefined, fluid(undefined, { tex: 'createdieselgenerators/gasoline_bucket' }))

// ---------- vanilla crafted ----------
add('minecraft:iron_nugget', 'Iron Nugget', 'nugget', C.iron)
add('minecraft:stick', 'Stick', 'stick', C.wood)
add('minecraft:oak_slab', 'Wooden Slab', 'slab', C.wood, undefined, { tex: 'minecraft/oak_slab' })
add('minecraft:chest', 'Chest', 'chest', C.wood)
add('minecraft:barrel', 'Barrel', 'chest', '#8a6338', '#5a4024')
add('minecraft:hopper', 'Hopper', 'hopper', C.dark)
add('minecraft:crafting_table', 'Crafting Table', 'block', C.wood, '#6b4a2e')
add('minecraft:redstone_torch', 'Redstone Torch', 'torch', C.red)
add('minecraft:clock', 'Clock', 'clock', C.gold)
add('minecraft:chain', 'Chain', 'chain', C.dark)
add('minecraft:piston', 'Piston', 'piston', C.wood, '#7d7d7a')
add('minecraft:iron_block', 'Block of Iron', 'block', C.iron)
add('minecraft:copper_block', 'Block of Copper', 'block', C.copper)
add('minecraft:redstone_block', 'Block of Redstone', 'block', C.red)

// ---------- Create ----------
add('create:andesite_alloy', 'Andesite Alloy', 'ingot', C.andesite)
add('create:zinc_nugget', 'Zinc Nugget', 'nugget', C.zinc)
add('create:brass_ingot', 'Brass Ingot', 'ingot', C.brass, undefined, { alloy: true })
add('create:iron_sheet', 'Iron Sheet', 'plate', C.iron)
add('create:copper_sheet', 'Copper Sheet', 'plate', C.copper)
add('create:golden_sheet', 'Golden Sheet', 'plate', C.gold)
add('create:brass_sheet', 'Brass Sheet', 'plate', C.brass)
add('create:shaft', 'Shaft', 'rod', C.iron)
add('create:cogwheel', 'Cogwheel', 'gear', C.wood, C.iron)
add('create:large_cogwheel', 'Large Cogwheel', 'biggear', C.wood, C.iron)
add('create:gearbox', 'Gearbox', 'casing', C.andesite, C.wood)
add('create:andesite_casing', 'Andesite Casing', 'casing', C.andesite, C.wood)
add('create:brass_casing', 'Brass Casing', 'casing', C.brass, C.wood)
add('create:copper_casing', 'Copper Casing', 'casing', C.copper, C.wood)
add('create:belt_connector', 'Mechanical Belt', 'belt', '#3a3d42')
add('create:deployer', 'Deployer', 'machine', C.andesite, C.brass)
add('create:brass_hand', 'Brass Hand', 'hand', C.brass)
add('create:andesite_funnel', 'Andesite Funnel', 'funnel', C.andesite)
add('create:brass_funnel', 'Brass Funnel', 'funnel', C.brass)
add('create:filter', 'List Filter', 'filter', C.white, C.iron)
add('create:mechanical_saw', 'Mechanical Saw', 'saw', C.andesite, C.iron)
add('create:mechanical_press', 'Mechanical Press', 'press', C.andesite, C.iron)
add('create:water_wheel', 'Water Wheel', 'wheel', C.wood)
add('create:large_water_wheel', 'Large Water Wheel', 'bigwheel', C.wood)
add('create:windmill_bearing', 'Windmill Bearing', 'machine', C.stone, C.wood)
add('create:mechanical_bearing', 'Mechanical Bearing', 'machine', C.andesite, C.wood)
add('create:white_sail', 'Sail', 'sail', C.white, C.wood)
add('create:super_glue', 'Super Glue', 'glue', C.slime)
add('create:fluid_tank', 'Fluid Tank', 'tank', C.copper)
add('create:fluid_pipe', 'Fluid Pipe', 'pipe', C.copper)
add('create:mechanical_pump', 'Mechanical Pump', 'pump', C.copper, C.wood)
add('create:steam_engine', 'Steam Engine', 'engine', C.copper, C.gold)
add('create:empty_blaze_burner', 'Empty Blaze Burner', 'burner', C.dark)
add('create:blaze_burner', 'Blaze Burner', 'burner', C.dark, C.blaze)
add('create:precision_mechanism', 'Precision Mechanism', 'gear', C.gold, C.brass)
add('create:mechanical_arm', 'Mechanical Arm', 'arm', C.brass)
add('create:mechanical_crafter', 'Mechanical Crafter', 'machine', C.brass, C.wood)
add('create:hand_crank', 'Hand Crank', 'stick', C.wood, C.andesite)
add('create:metal_girder', 'Metal Girder', 'rodblock', C.dark)
add('create:industrial_iron_block', 'Industrial Iron Block', 'block', '#6d7277')
add('create:andesite_scaffolding', 'Andesite Scaffolding', 'rodblock', C.andesite)
add('create:zinc_block', 'Block of Zinc', 'block', C.zinc)
add('create:mechanical_piston', 'Mechanical Piston', 'piston', C.andesite, C.wood)
add('create:piston_extension_pole', 'Piston Extension Pole', 'rod', C.wood)
add('create:blaze_cake', 'Blaze Cake', 'box', C.blaze, '#8a3b36', raw('Compact egg + sugar + cinder flour, then spout 250 mB lava on it'))
add('create:basin', 'Basin', 'tank', C.andesite)
add('create:mechanical_mixer', 'Mechanical Mixer', 'machine', C.andesite, C.iron)
add('create:spout', 'Spout', 'tank', C.copper, C.dark)

// ---------- Crafts & Additions ----------
add('createaddition:alternator', 'Alternator', 'machine', C.copper, C.iron)
add('createaddition:electric_motor', 'Electric Motor', 'machine', C.brass, C.copper)
add('createaddition:capacitor', 'Capacitor', 'chip', C.zinc, C.copper)
add('createaddition:copper_spool', 'Copper Spool', 'coil', C.copper, C.iron)
add('createaddition:spool', 'Spool', 'coil', C.iron)
add('createaddition:iron_rod', 'Iron Rod', 'rod', C.iron)
add('createaddition:copper_rod', 'Copper Rod', 'rod', C.copper)
add('createaddition:zinc_sheet', 'Zinc Sheet', 'plate', C.zinc)
add('createaddition:gold_wire', 'Gold Wire', 'wire', C.gold)
add('createaddition:connector', 'Small Connector', 'chip', C.copper, C.andesite)
add('createaddition:modular_accumulator', 'Modular Accumulator', 'machine', C.brass, C.copper)
add('createaddition:rolling_mill', 'Rolling Mill', 'machine', C.andesite, C.iron)

// ---------- Create Diesel Generators ----------
add('createdieselgenerators:huge_diesel_engine', 'Huge Diesel Engine', 'engine', C.dark, C.diesel)
add('createdieselgenerators:large_diesel_engine', 'Modular Diesel Engine', 'engine', C.dark, C.brass)
add('createdieselgenerators:diesel_engine', 'Diesel Engine', 'engine', C.dark, C.iron)
add('createdieselgenerators:engine_piston', 'Engine Piston', 'piston', C.steel, C.iron)
add('createdieselgenerators:pumpjack_bearing', 'Pumpjack Bearing', 'machine', C.andesite, C.zinc)
add('createdieselgenerators:pumpjack_head', 'Pumpjack Head', 'machine', C.zinc, C.andesite)
add('createdieselgenerators:pumpjack_hole', 'Pumpjack Hole', 'casing', C.copper, C.dark)
add('createdieselgenerators:pumpjack_crank', 'Pumpjack Crank', 'machine', C.andesite, C.iron)
add('createdieselgenerators:distillation_controller', 'Distillation Controller', 'clock', C.copper, C.iron)
add('createdieselgenerators:oil_scanner', 'Oil Scanner', 'scanner', C.andesite, C.gold)

// ---------- Immersive Engineering ----------
add('immersiveengineering:ingot_steel', 'Steel Ingot', 'ingot', C.steel, undefined, { alloy: true })
add('immersiveengineering:ingot_constantan', 'Constantan Ingot', 'ingot', C.constantan, undefined, { alloy: true })
add('immersiveengineering:ingot_electrum', 'Electrum Ingot', 'ingot', C.electrum, undefined, { alloy: true })
add('immersiveengineering:nugget_lead', 'Lead Nugget', 'nugget', C.lead)
add('immersiveengineering:plate_steel', 'Steel Plate', 'plate', C.steel)
add('immersiveengineering:plate_constantan', 'Constantan Plate', 'plate', C.constantan)
add('immersiveengineering:plate_lead', 'Lead Plate', 'plate', C.lead)
add('immersiveengineering:plate_aluminum', 'Aluminum Plate', 'plate', C.alu)
add('immersiveengineering:plate_electrum', 'Electrum Plate', 'plate', C.electrum)
add('immersiveengineering:plate_nickel', 'Nickel Plate', 'plate', C.nickel)
add('immersiveengineering:stick_steel', 'Steel Rod', 'rod', C.steel)
add('immersiveengineering:wire_copper', 'Copper Wire', 'wire', C.copper)
add('immersiveengineering:wire_electrum', 'Electrum Wire', 'wire', C.electrum)
add('immersiveengineering:wire_aluminum', 'Aluminum Wire', 'wire', C.alu)
add('immersiveengineering:wirecoil_copper', 'LV Wire Coil', 'coil', C.copper, C.wood)
add('immersiveengineering:coil_lv', 'Copper Coil Block', 'coil', C.copper, C.iron)
add('immersiveengineering:thermoelectric_generator', 'Thermoelectric Generator', 'machine', C.constantan, C.steel)
add('immersiveengineering:connector_lv', 'LV Wire Connector', 'chip', '#a5624a', C.copper)
add('immersiveengineering:component_steel', 'Steel Mechanical Component', 'gear', C.steel, C.copper)
add('immersiveengineering:component_electronic', 'Electronic Component', 'chip', C.green, C.treated)
add('immersiveengineering:electron_tube', 'Vacuum Tube', 'tube', C.glass, C.nickel)
add('immersiveengineering:treated_wood_horizontal', 'Treated Wood', 'planks', C.treated)
add('immersiveengineering:slab_treated_wood_horizontal', 'Treated Wood Slab', 'slab', C.treated)
add('immersiveengineering:storage_aluminum', 'Block of Aluminum', 'block', C.alu)
add('immersiveengineering:storage_lead', 'Block of Lead', 'block', C.lead)
add('immersiveengineering:graphite_electrode', 'Graphite Electrode', 'rod', C.black)
add('immersiveengineering:steel_scaffolding_standard', 'Steel Scaffolding', 'rodblock', C.steel)
add('immersiveengineering:circuit_board', 'Circuit Board', 'chip', C.green, C.copper)

// ---------- Refined Storage ----------
add('refinedstorage:machine_casing', 'RS Machine Casing', 'casing', C.alu, C.plastic)
add('refinedstorage:controller', 'RS Controller', 'machine', C.silicon, C.purple)
add('refinedstorage:advanced_processor', 'Advanced Processor', 'chip', C.purple, C.silicon)
add('refinedstorage:raw_advanced_processor', 'Raw Advanced Processor', 'chip', C.silicon, C.purple)
add('refinedstorage:cable', 'RS Cable', 'pipe', C.plastic)

// ---------- Extreme Reactors ----------
add('bigreactors:reinforced_reactorcasing', 'Reinforced Reactor Casing', 'reactor', C.steel, C.lead)
add('bigreactors:reinforced_reactorcontroller', 'Reinforced Reactor Controller', 'reactor', C.steel, C.purple)
add('bigreactors:reinforced_reactorfuelrod', 'Reinforced Reactor Fuel Rod', 'tube', C.glass, C.uranium)
add('bigreactors:reinforced_reactorcontrolrod', 'Reinforced Reactor Control Rod', 'reactor', C.steel, C.black)
add('bigreactors:reinforced_reactorpowertapfe_passive', 'Reinforced Power Port (Passive)', 'reactor', C.steel, C.red)
add('bigreactors:reinforced_reactorsolidaccessport', 'Reinforced Solid Access Port', 'reactor', C.steel, C.brass)

// ---------- pack items: ammo & gun parts ----------
add('createbigcannons:gunpowder_pinch', 'Gunpowder Pinch', 'dust', '#6b6b6b')
add('createbigcannons:spring_wire', 'Spring Wire', 'wire', C.steel)
add('createbigcannons:recoil_spring', 'Recoil Spring', 'spring', C.steel)
add('apocalypsenow:cardboard_box', 'Cardboard Box', 'box', '#b08a58')
add('deceasedcraft:rubber', 'Rubber', 'ingot', '#2f2f33', undefined, raw('Heated mixer: phenolic resin + seed oil → rubber base, then + 500 mB redstone acid'))
add('deceasedcraft:bullet_casing_9mm_round', 'Bullet Casing (any standard caliber)', 'nugget', C.brass, undefined, { tex: 'deceasedcraft/bullet_casing_9mm_round' })
add('deceasedcraft:bullet_casing_50bmg', '.50 BMG Casing', 'nugget', C.brass)
add('deceasedcraft:mold_bullet_casing_9mm', 'Casing Mold (per caliber)', 'plate', C.steel, C.brass, raw('Pack item: one per caliber, never used up'))
add('deceasedcraft:blueprint', 'Assembly Blueprint (per kit)', 'plate', C.blue, C.white, raw('Pack item: one per kit type, never used up', { tex: 'deceasedcraft/pistol_assembly_parts_blueprint' }))
add('tacz:ammo', 'Round (standard caliber)', 'nugget', C.brass, C.lead)
add('deceasedcraft:pistol_assembly_parts', 'Gun Part Kit (pistol, SMG…)', 'box', '#b08a58', C.steel)
add('deceasedcraft:rifle_assembly_parts', 'Gun Part Kit (shotgun, rifle)', 'box', '#b08a58', C.steel)
add('deceasedcraft:sniper_assembly_parts', 'Gun Part Kit (sniper, HMG, special)', 'box', '#b08a58', '#5a4440')
add('deceasedcraft:attachment_assembly_parts', 'Attachment Parts', 'box', '#b08a58', '#2f2f33')

export function item(id: string): Item {
  const it = ITEMS[id]
  if (!it) {
    // unknown: make a placeholder so the UI never crashes
    const name = id.split(':').pop()!.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
    ITEMS[id] = { id, name, mod: MODS[id.split(':')[0]] || id.split(':')[0], icon: { shape: 'box', c: '#888888' } }
    return ITEMS[id]
  }
  return it
}

/** path of the rendered real icon (public/icons, listed in icons/manifest.json) */
export function texPath(it: Item): string {
  return `icons/${it.id.replace(':', '/')}.png`
}
