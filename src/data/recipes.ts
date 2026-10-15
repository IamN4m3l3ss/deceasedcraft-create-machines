// Recipes as they are in DeceasedCraft Beta DH 5.10.17. Sources: the pack's KubeJS scripts
// (overrides/kubejs/server_scripts), plus the recipe JSONs of Create 6.0.6, Immersive Engineering 10.2,
// Crafts & Additions, Create Diesel Generators, Extreme Reactors and Refined Storage for anything the pack
// leaves alone. "primary" recipes drive the material totals; alternatives are shown on the item card only.

export type Stack = [string, number]

export interface Step { kind: 'deploy' | 'press' | 'cut' | 'fill'; item?: string; qty?: number; kept?: boolean }

export interface Recipe {
  id: string
  out: string
  /** items made per craft; may be fractional for chance outputs (expected value) */
  n: number
  station: string
  in: Stack[]
  grid?: { pattern: string[]; key: Record<string, string> }
  /** sequenced assembly */
  base?: string
  steps?: Step[]
  loops?: number
  note?: string
  alt?: boolean
  pack?: boolean
}

export const RECIPES: Recipe[] = []
let seq = 0
type Extra = Partial<Pick<Recipe, 'note' | 'alt' | 'pack'>>

function push(r: Omit<Recipe, 'id'>) { RECIPES.push({ id: 'r' + seq++, ...r }) }

function shaped(out: string, n: number, pattern: string[], key: Record<string, string>, ex: Extra = {}, stationId = 'crafting') {
  const count: Record<string, number> = {}
  for (const row of pattern) for (const ch of row) if (ch !== ' ') count[ch] = (count[ch] || 0) + 1
  const inputs: Stack[] = Object.entries(count).map(([k, v]) => [key[k], v])
  push({ out, n, station: stationId, in: inputs, grid: { pattern, key }, ...ex })
}
function shapeless(out: string, n: number, inputs: Stack[], ex: Extra = {}) { push({ out, n, station: 'crafting', in: inputs, ...ex }) }
function machine(stationId: string, out: string, n: number, inputs: Stack[], ex: Extra = {}) { push({ out, n, station: stationId, in: inputs, ...ex }) }
function assembly(out: string, n: number, base: string, steps: Step[], loops: number, ex: Extra = {}) {
  const tot: Record<string, number> = { [base]: 1 }
  for (const s of steps) if (s.item && !s.kept) tot[s.item] = (tot[s.item] || 0) + (s.qty || 1) * loops
  push({ out, n, station: 'sequenced_assembly', in: Object.entries(tot) as Stack[], base, steps, loops, ...ex })
}
const D = (item: string, kept = false): Step => ({ kind: 'deploy', item, kept })
const F = (item: string, qty: number): Step => ({ kind: 'fill', item, qty })
const PRESS: Step = { kind: 'press' }
const CUT: Step = { kind: 'cut' }

// ---------------- vanilla ----------------
shapeless('minecraft:iron_nugget', 9, [['minecraft:iron_ingot', 1]])
shaped('minecraft:stick', 4, ['P', 'P'], { P: 'minecraft:oak_planks' })
shaped('minecraft:oak_slab', 6, ['PPP'], { P: 'minecraft:oak_planks' })
shaped('minecraft:chest', 1, ['PPP', 'P P', 'PPP'], { P: 'minecraft:oak_planks' })
shaped('minecraft:barrel', 1, ['PSP', 'P P', 'PSP'], { P: 'minecraft:oak_planks', S: 'minecraft:oak_slab' })
shaped('minecraft:hopper', 1, ['I I', 'ICI', ' I '], { I: 'minecraft:iron_ingot', C: 'minecraft:chest' })
shaped('minecraft:crafting_table', 1, ['PP', 'PP'], { P: 'minecraft:oak_planks' })
shaped('minecraft:redstone_torch', 1, ['R', 'S'], { R: 'minecraft:redstone', S: 'minecraft:stick' })
shaped('minecraft:clock', 1, [' G ', 'GRG', ' G '], { G: 'minecraft:gold_ingot', R: 'minecraft:redstone' })
shaped('minecraft:chain', 1, ['N', 'I', 'N'], { N: 'minecraft:iron_nugget', I: 'minecraft:iron_ingot' })
shaped('minecraft:piston', 1, ['PPP', 'CIC', 'CRC'], { P: 'minecraft:oak_planks', C: 'minecraft:cobblestone', I: 'minecraft:iron_ingot', R: 'minecraft:redstone' })
shaped('minecraft:iron_block', 1, ['III', 'III', 'III'], { I: 'minecraft:iron_ingot' })
shaped('minecraft:copper_block', 1, ['III', 'III', 'III'], { I: 'minecraft:copper_ingot' })
shaped('minecraft:redstone_block', 1, ['III', 'III', 'III'], { I: 'minecraft:redstone' })

// ---------------- Create: materials ----------------
machine('mixing', 'create:andesite_alloy', 1, [['minecraft:andesite', 1], ['minecraft:iron_nugget', 1]], { note: 'A zinc nugget works instead of the iron nugget.' })
shaped('create:andesite_alloy', 1, ['NA', 'AN'], { A: 'minecraft:andesite', N: 'minecraft:iron_nugget' }, { alt: true })
shapeless('create:zinc_nugget', 9, [['create:zinc_ingot', 1]])
machine('ie_alloy_kiln', 'create:brass_ingot', 2, [['minecraft:copper_ingot', 1], ['create:zinc_ingot', 1]], { note: 'No power needed, runs on coal.' })
machine('mixing_heated', 'create:brass_ingot', 2, [['minecraft:copper_ingot', 1], ['create:zinc_ingot', 1]], { alt: true })
machine('pressing', 'create:iron_sheet', 1, [['minecraft:iron_ingot', 1]])
machine('pressing', 'create:copper_sheet', 1, [['minecraft:copper_ingot', 1]])
machine('pressing', 'create:golden_sheet', 1, [['minecraft:gold_ingot', 1]])
machine('pressing', 'create:brass_sheet', 1, [['create:brass_ingot', 1]])
shaped('create:zinc_block', 1, ['III', 'III', 'III'], { I: 'create:zinc_ingot' })
machine('stonecutting', 'create:industrial_iron_block', 2, [['minecraft:iron_ingot', 1]])
machine('stonecutting', 'create:andesite_scaffolding', 2, [['create:andesite_alloy', 1]])

// ---------------- Create: kinetics ----------------
shaped('create:shaft', 8, ['A', 'A'], { A: 'create:andesite_alloy' })
machine('cutting', 'create:shaft', 6, [['create:andesite_alloy', 1]], { alt: true })
shapeless('create:cogwheel', 1, [['create:shaft', 1], ['minecraft:oak_planks', 1]])
shapeless('create:large_cogwheel', 1, [['create:shaft', 1], ['minecraft:oak_planks', 2]])
shaped('create:gearbox', 1, [' C ', 'CBC', ' C '], { C: 'create:cogwheel', B: 'create:andesite_casing' })
machine('item_application', 'create:andesite_casing', 1, [['minecraft:stripped_oak_log', 1], ['create:andesite_alloy', 1]])
machine('item_application', 'create:brass_casing', 1, [['minecraft:stripped_oak_log', 1], ['create:brass_ingot', 1]])
machine('item_application', 'create:copper_casing', 1, [['minecraft:stripped_oak_log', 1], ['minecraft:copper_ingot', 1]])
shaped('create:belt_connector', 1, ['KKK', 'KKK'], { K: 'minecraft:dried_kelp' }, { note: 'One belt item covers a whole belt, up to 20 blocks long. It also needs a shaft at each end.' })
shaped('create:deployer', 1, ['E', 'C', 'H'], { E: 'immersiveengineering:component_electronic', C: 'create:andesite_casing', H: 'create:brass_hand' }, { pack: true, note: 'The pack swaps the Electron Tube for an IE Electronic Component.' })
shaped('create:brass_hand', 1, [' A ', 'BBB', ' B '], { A: 'create:andesite_alloy', B: 'create:brass_sheet' })
shaped('create:andesite_funnel', 2, ['A', 'K'], { A: 'create:andesite_alloy', K: 'minecraft:dried_kelp' })
shaped('create:brass_funnel', 2, ['E', 'B', 'K'], { E: 'immersiveengineering:component_electronic', B: 'create:brass_ingot', K: 'minecraft:dried_kelp' }, { pack: true })
shaped('create:filter', 1, ['NWN'], { N: 'minecraft:iron_nugget', W: 'minecraft:white_wool' })
shaped('create:mechanical_saw', 1, [' S ', 'SIS', ' C '], { S: 'create:iron_sheet', I: 'minecraft:iron_ingot', C: 'create:andesite_casing' })
shaped('create:mechanical_press', 1, ['S', 'C', 'B'], { S: 'create:shaft', C: 'create:andesite_casing', B: 'minecraft:iron_block' })
shaped('create:water_wheel', 1, ['PPP', 'PSP', 'PPP'], { P: 'minecraft:oak_planks', S: 'create:shaft' })
shaped('create:large_water_wheel', 1, ['PPP', 'PWP', 'PPP'], { P: 'minecraft:oak_planks', W: 'create:water_wheel' })
shaped('create:windmill_bearing', 1, ['L', 'S', 'H'], { L: 'minecraft:oak_slab', S: 'minecraft:stone', H: 'create:shaft' })
shaped('create:mechanical_bearing', 1, ['L', 'C', 'H'], { L: 'minecraft:oak_slab', C: 'create:andesite_casing', H: 'create:shaft' })
shaped('create:white_sail', 2, ['WS', 'SA'], { W: 'minecraft:white_wool', S: 'minecraft:stick', A: 'create:andesite_alloy' })
shaped('create:super_glue', 1, ['GS', 'NG'], { G: 'minecraft:slime_ball', S: 'create:iron_sheet', N: 'minecraft:iron_nugget' })
shaped('create:fluid_tank', 1, ['S', 'B', 'S'], { S: 'create:copper_sheet', B: 'minecraft:barrel' })
shaped('create:fluid_pipe', 4, ['SCS'], { S: 'create:copper_sheet', C: 'minecraft:copper_ingot' })
shapeless('create:mechanical_pump', 1, [['create:cogwheel', 1], ['create:fluid_pipe', 1]])
shaped('create:steam_engine', 1, ['G', 'A', 'B'], { G: 'create:golden_sheet', A: 'create:andesite_alloy', B: 'minecraft:copper_block' })
shaped('create:empty_blaze_burner', 1, [' S ', 'SNS', ' S '], { S: 'create:iron_sheet', N: 'minecraft:netherrack' })
machine('capture', 'create:blaze_burner', 1, [['create:empty_blaze_burner', 1], ['minecraft:blaze', 1]])
assembly('create:precision_mechanism', 0.8, 'create:golden_sheet', [D('create:cogwheel'), D('create:large_cogwheel'), D('minecraft:iron_nugget')], 5,
  { note: '80% of runs give a Precision Mechanism; the rest give scrap (golden sheet, alloy, cogs…). Totals use the average: 1.25 runs per mechanism.' })
shaped('create:mechanical_arm', 1, ['BBA', 'B  ', 'PEC'], { B: 'create:brass_sheet', A: 'create:andesite_alloy', P: 'create:precision_mechanism', E: 'immersiveengineering:component_electronic', C: 'create:brass_casing' }, { pack: true })
shaped('create:mechanical_crafter', 3, ['E', 'C', 'T'], { E: 'immersiveengineering:component_electronic', C: 'create:brass_casing', T: 'minecraft:crafting_table' }, { pack: true })
shaped('create:hand_crank', 1, ['PPP', '  A'], { P: 'minecraft:oak_planks', A: 'create:andesite_alloy' })
shaped('create:metal_girder', 8, ['SSS', 'AAA'], { S: 'create:iron_sheet', A: 'create:andesite_alloy' })
shaped('create:piston_extension_pole', 8, ['P', 'A', 'P'], { P: 'minecraft:oak_planks', A: 'create:andesite_alloy' })
shaped('create:mechanical_piston', 1, ['L', 'C', 'P'], { L: 'minecraft:oak_slab', C: 'create:andesite_casing', P: 'create:piston_extension_pole' })

// ---------------- Crafts & Additions ----------------
shaped('createaddition:alternator', 1, ['  A  ', ' ISI ', 'ISRSI', ' ICI ', '  A  '], {
  A: 'create:andesite_alloy', I: 'create:iron_sheet', S: 'createaddition:copper_spool', R: 'createaddition:iron_rod', C: 'createaddition:capacitor',
}, { pack: true, note: 'Pack recipe on 13 Mechanical Crafters in a diamond.' }, 'mechanical_crafting')
shaped('createaddition:capacitor', 1, ['Z', 'C', 'T'], { Z: 'createaddition:zinc_sheet', C: 'create:copper_sheet', T: 'minecraft:redstone_torch' })
shaped('createaddition:copper_spool', 1, [' W ', 'WSW', ' W '], { W: 'immersiveengineering:wire_copper', S: 'createaddition:spool' })
shaped('createaddition:spool', 16, ['S', 'N', 'S'], { S: 'create:iron_sheet', N: 'minecraft:iron_nugget' })
machine('rolling', 'createaddition:iron_rod', 2, [['minecraft:iron_ingot', 1]])
machine('rolling', 'createaddition:copper_rod', 2, [['minecraft:copper_ingot', 1]])
machine('rolling', 'createaddition:gold_wire', 2, [['create:golden_sheet', 1]])
machine('pressing', 'createaddition:zinc_sheet', 1, [['create:zinc_ingot', 1]])
shapeless('createaddition:connector', 3, [['createaddition:copper_rod', 1], ['create:andesite_alloy', 1], ['minecraft:slime_ball', 1]])
shaped('createaddition:modular_accumulator', 1, [' R ', 'CBC', ' W '], { R: 'createaddition:copper_rod', C: 'createaddition:capacitor', B: 'create:brass_casing', W: 'createaddition:gold_wire' })
shaped('createaddition:rolling_mill', 1, ['SHS', 'AHA', 'ACA'], { S: 'create:iron_sheet', H: 'create:shaft', A: 'create:andesite_alloy', C: 'create:andesite_casing' })

// ---------------- Create Diesel Generators (engines are pack sequenced-assembly recipes) ----------------
const engineSteps = [CUT, F('fluid:redstone_acid', 50), D('createdieselgenerators:engine_piston'), D('create:precision_mechanism'), D('immersiveengineering:plate_steel'), PRESS]
assembly('createdieselgenerators:engine_piston', 1, 'minecraft:piston', [D('immersiveengineering:stick_steel'), D('immersiveengineering:stick_steel'), D('immersiveengineering:plate_steel'), PRESS], 1, { pack: true })
assembly('createdieselgenerators:diesel_engine', 1, 'immersiveengineering:storage_aluminum', engineSteps, 3, { pack: true })
assembly('createdieselgenerators:large_diesel_engine', 1, 'createdieselgenerators:diesel_engine', engineSteps, 3, { pack: true })
assembly('createdieselgenerators:huge_diesel_engine', 1, 'createdieselgenerators:large_diesel_engine', engineSteps, 3, { pack: true, note: 'Starts from a modular engine, which starts from a normal engine: 9 runs of these 6 steps per huge engine.' })
shaped('createdieselgenerators:pumpjack_bearing', 1, ['AZA', 'ZBZ', 'AZA'], { A: 'create:andesite_alloy', Z: 'create:zinc_ingot', B: 'create:mechanical_bearing' })
shaped('createdieselgenerators:pumpjack_head', 1, ['A A', 'ZKZ', 'A A'], { A: 'create:andesite_alloy', Z: 'create:zinc_ingot', K: 'minecraft:dried_kelp' })
shaped('createdieselgenerators:pumpjack_hole', 1, [' P ', 'cCc', ' P '], { P: 'create:fluid_pipe', c: 'minecraft:chain', C: 'create:copper_casing' })
shaped('createdieselgenerators:pumpjack_crank', 1, ['AIA', ' S ', 'AIA', 'ZSZ', 'AZA'], { A: 'create:andesite_alloy', I: 'create:iron_sheet', S: 'create:shaft', Z: 'create:zinc_ingot' }, { note: '13 Mechanical Crafters, 3 wide and 5 tall.' }, 'mechanical_crafting')
shaped('createdieselgenerators:distillation_controller', 4, ['PCP', 'AIA'], { P: 'create:fluid_pipe', C: 'minecraft:clock', A: 'create:andesite_alloy', I: 'create:iron_sheet' }, { note: 'Right-click a fluid tank with them: each tank block uses up one controller.' })
shaped('createdieselgenerators:oil_scanner', 1, ['ACA', 'SIS', ' I '], { A: 'create:andesite_alloy', C: 'minecraft:clock', S: 'create:iron_sheet', I: 'minecraft:iron_ingot' })

// ---------------- Immersive Engineering ----------------
machine('ie_blast_furnace', 'immersiveengineering:ingot_steel', 1, [['minecraft:iron_ingot', 1]], { note: 'Fuel: coal coke. Each ingot takes 60 s, so build 2–3 furnaces side by side.' })
machine('mixing_superheated', 'immersiveengineering:ingot_steel', 1, [['minecraft:iron_ingot', 1], ['immersiveengineering:coal_coke', 1]], { alt: true, pack: true, note: 'Pack recipe; the coke has to be milled to dust first.' })
machine('ie_alloy_kiln', 'immersiveengineering:ingot_constantan', 2, [['minecraft:copper_ingot', 1], ['immersiveengineering:ingot_nickel', 1]])
machine('mixing', 'immersiveengineering:ingot_constantan', 2, [['minecraft:copper_ingot', 1], ['immersiveengineering:ingot_nickel', 1]], { alt: true })
machine('ie_alloy_kiln', 'immersiveengineering:ingot_electrum', 2, [['minecraft:gold_ingot', 1], ['immersiveengineering:ingot_silver', 1]])
shapeless('immersiveengineering:nugget_lead', 9, [['immersiveengineering:ingot_lead', 1]])
machine('pressing', 'immersiveengineering:plate_steel', 1, [['immersiveengineering:ingot_steel', 1]])
machine('pressing', 'immersiveengineering:plate_constantan', 1, [['immersiveengineering:ingot_constantan', 1]])
machine('pressing', 'immersiveengineering:plate_lead', 1, [['immersiveengineering:ingot_lead', 1]])
machine('pressing', 'immersiveengineering:plate_aluminum', 1, [['immersiveengineering:ingot_aluminum', 1]])
machine('pressing', 'immersiveengineering:plate_electrum', 1, [['immersiveengineering:ingot_electrum', 1]])
machine('pressing', 'immersiveengineering:plate_nickel', 1, [['immersiveengineering:ingot_nickel', 1]])
machine('rolling', 'immersiveengineering:stick_steel', 2, [['immersiveengineering:ingot_steel', 1]])
machine('crafting', 'immersiveengineering:stick_steel', 1, [['immersiveengineering:ingot_steel', 1]], { alt: true, pack: true, note: 'Pack recipe: steel ingot + wirecutter. Half the output of the rolling mill.' })
machine('cutting', 'immersiveengineering:wire_copper', 2, [['create:copper_sheet', 1]])
machine('cutting', 'immersiveengineering:wire_electrum', 2, [['immersiveengineering:plate_electrum', 1]])
machine('cutting', 'immersiveengineering:wire_aluminum', 2, [['immersiveengineering:plate_aluminum', 1]])
shaped('immersiveengineering:wirecoil_copper', 4, [' W ', 'WSW', ' W '], { W: 'immersiveengineering:wire_copper', S: 'minecraft:stick' })
shaped('immersiveengineering:coil_lv', 1, ['WWW', 'WIW', 'WWW'], { W: 'immersiveengineering:wirecoil_copper', I: 'minecraft:iron_ingot' })
shaped('immersiveengineering:thermoelectric_generator', 1, ['SSS', 'CLC', 'CCC'], { S: 'immersiveengineering:ingot_steel', C: 'immersiveengineering:plate_constantan', L: 'immersiveengineering:coil_lv' })
shaped('immersiveengineering:connector_lv', 4, [' I ', 'TIT', 'TIT'], { I: 'minecraft:copper_ingot', T: 'minecraft:terracotta' })
machine('ie_workbench', 'immersiveengineering:component_steel', 1, [['immersiveengineering:plate_steel', 2], ['minecraft:copper_ingot', 1]], { note: 'Components blueprint.' })
shaped('immersiveengineering:component_steel', 1, ['S S', ' C ', 'S S'], { S: 'immersiveengineering:plate_steel', C: 'minecraft:copper_ingot' }, { alt: true, note: 'Hand recipe: twice the steel of the workbench.' })
machine('ie_workbench', 'immersiveengineering:component_electronic', 1, [['immersiveengineering:slab_treated_wood_horizontal', 1], ['minecraft:quartz', 1], ['minecraft:redstone', 1], ['immersiveengineering:wire_electrum', 1]], { note: 'Components blueprint. Cheaper than the pack’s sequenced-assembly recipe.' })
assembly('immersiveengineering:component_electronic', 1, 'immersiveengineering:slab_treated_wood_horizontal', [D('immersiveengineering:wire_electrum'), D('immersiveengineering:electron_tube'), D('minecraft:redstone')], 1, { alt: true, pack: true })
machine('ie_workbench', 'immersiveengineering:electron_tube', 3, [['minecraft:glass', 1], ['immersiveengineering:plate_nickel', 1], ['immersiveengineering:wire_copper', 1], ['minecraft:redstone', 1]], { note: 'Components blueprint.' })
machine('filling', 'immersiveengineering:treated_wood_horizontal', 1, [['minecraft:oak_planks', 1], ['fluid:creosote', 125]])
shaped('immersiveengineering:slab_treated_wood_horizontal', 6, ['TTT'], { T: 'immersiveengineering:treated_wood_horizontal' })
shaped('immersiveengineering:storage_aluminum', 1, ['III', 'III', 'III'], { I: 'immersiveengineering:ingot_aluminum' })
shaped('immersiveengineering:storage_lead', 1, ['III', 'III', 'III'], { I: 'immersiveengineering:ingot_lead' })
machine('ie_metal_press', 'immersiveengineering:graphite_electrode', 1, [['immersiveengineering:ingot_hop_graphite', 4]], { note: 'Rod mold.' })
shaped('immersiveengineering:steel_scaffolding_standard', 6, ['III', ' R ', 'R R'], { I: 'immersiveengineering:ingot_steel', R: 'immersiveengineering:stick_steel' })
machine('ie_workbench', 'immersiveengineering:circuit_board', 1, [['immersiveengineering:plate_duroplast', 1], ['create:copper_sheet', 1]], { note: 'Components blueprint.' })
machine('mixing_heated', 'fluid:redstone_acid', 250, [['minecraft:redstone', 1]], { pack: true, note: 'Pack recipe: 1 redstone → 250 mB.' })

// ---------------- Refined Storage (pack recipes) ----------------
shaped('refinedstorage:machine_casing', 1, ['APA', 'P P', 'APA'], { A: 'immersiveengineering:plate_aluminum', P: 'immersiveengineering:plate_duroplast' }, { pack: true })
shaped('refinedstorage:controller', 1, ['DPD', 'SMS', 'DSD'], { D: 'immersiveengineering:plate_duroplast', P: 'refinedstorage:advanced_processor', S: 'refinedstorage:silicon', M: 'refinedstorage:machine_casing' }, { pack: true, note: 'The pack swaps Quartz Enriched Iron for Duroplast Plates.' })
assembly('refinedstorage:advanced_processor', 1, 'immersiveengineering:circuit_board', [D('refinedstorage:raw_advanced_processor'), F('fluid:redstone_acid', 100), D('immersiveengineering:wire_aluminum'), D('immersiveengineering:plate_duroplast')], 1, { pack: true })
machine('ie_metal_press', 'refinedstorage:raw_advanced_processor', 1, [['refinedstorage:silicon', 1]], { pack: true, note: 'Advanced processor mold.' })
shaped('refinedstorage:cable', 16, ['GGG', 'PSP', 'GGG'], { G: 'minecraft:glass', P: 'immersiveengineering:plate_duroplast', S: 'createaddition:copper_spool' }, { pack: true })

// ---------------- Extreme Reactors (pack recipes) ----------------
shaped('bigreactors:reinforced_reactorcasing', 1, ['SLS', 'LML', 'SLS'], { S: 'immersiveengineering:plate_steel', L: 'immersiveengineering:plate_lead', M: 'refinedstorage:machine_casing' }, { pack: true })
shaped('bigreactors:reinforced_reactorfuelrod', 1, ['SRS', 'GUG', 'SRS'], { S: 'immersiveengineering:plate_steel', R: 'immersiveengineering:stick_steel', G: 'minecraft:glass', U: 'immersiveengineering:ingot_uranium' }, { pack: true })
shaped('bigreactors:reinforced_reactorcontroller', 1, ['CPC', 'KRK', 'CPC'], { C: 'bigreactors:reinforced_reactorcasing', P: 'refinedstorage:advanced_processor', K: 'refinedstorage:cable', R: 'refinedstorage:controller' }, { pack: true })
shaped('bigreactors:reinforced_reactorcontrolrod', 1, ['SPS', 'LGL', 'SGS'], { S: 'immersiveengineering:plate_steel', P: 'create:mechanical_piston', L: 'immersiveengineering:plate_lead', G: 'immersiveengineering:graphite_electrode' }, { pack: true })
shaped('bigreactors:reinforced_reactorsolidaccessport', 1, ['CHC', 'LSL', 'CAC'], { C: 'bigreactors:reinforced_reactorcasing', H: 'minecraft:hopper', L: 'immersiveengineering:plate_lead', S: 'immersiveengineering:steel_scaffolding_standard', A: 'create:mechanical_arm' }, { pack: true })
shaped('bigreactors:reinforced_reactorpowertapfe_passive', 1, ['CRC', 'RBR', 'CRC'], { C: 'bigreactors:reinforced_reactorcasing', R: 'minecraft:redstone', B: 'minecraft:redstone_block' })

// ---------------- ammo & gun parts (pack recipes) ----------------
shapeless('createbigcannons:gunpowder_pinch', 4, [['minecraft:gunpowder', 1]], { pack: true })
machine('ie_metal_press', 'deceasedcraft:bullet_casing_9mm_round', 4, [['create:brass_ingot', 1]], { pack: true, note: 'One mold per caliber. 12 standard calibers give 4 casings per ingot.' })
machine('ie_metal_press', 'deceasedcraft:bullet_casing_50bmg', 2, [['create:brass_ingot', 1]], { pack: true })
assembly('tacz:ammo', 1, 'deceasedcraft:bullet_casing_9mm_round', [D('createbigcannons:gunpowder_pinch'), D('immersiveengineering:nugget_lead')], 1, { pack: true, note: 'Same two steps for all 12 standard calibers.' })
machine('cutting', 'createbigcannons:spring_wire', 3, [['immersiveengineering:plate_steel', 1]], { note: 'Put a Spring Wire filter on the saw: steel plate has a second cutting recipe.' })
assembly('createbigcannons:recoil_spring', 1, 'createbigcannons:spring_wire', [PRESS], 3)
shaped('apocalypsenow:cardboard_box', 1, ['PPP', 'PSP', 'PPP'], { P: 'minecraft:paper', S: 'minecraft:slime_ball' }, { pack: true })
const kit = (special: string): Step[] => [D('deceasedcraft:blueprint', true), D('immersiveengineering:stick_steel'), D('immersiveengineering:plate_steel'), D('createbigcannons:recoil_spring'), D('immersiveengineering:component_steel'), D(special)]
assembly('deceasedcraft:pistol_assembly_parts', 1, 'apocalypsenow:cardboard_box', kit('minecraft:iron_ingot'), 4, { pack: true, note: 'Pistol and SMG kits.' })
assembly('deceasedcraft:rifle_assembly_parts', 1, 'apocalypsenow:cardboard_box', kit('immersiveengineering:ingot_steel'), 4, { pack: true, note: 'Shotgun and rifle kits.' })
assembly('deceasedcraft:sniper_assembly_parts', 1, 'apocalypsenow:cardboard_box', kit('minecraft:netherite_scrap'), 4, { pack: true, note: 'Sniper, HMG and special kits.' })
assembly('deceasedcraft:attachment_assembly_parts', 1, 'apocalypsenow:cardboard_box',
  [D('deceasedcraft:blueprint', true), D('immersiveengineering:stick_steel'), D('immersiveengineering:plate_steel'), D('immersiveengineering:component_steel'), D('deceasedcraft:rubber')], 1, { pack: true })

// ---------------- lookups ----------------
export const PRIMARY: Record<string, Recipe> = {}
export const BY_OUT: Record<string, Recipe[]> = {}
export const USED_IN: Record<string, Recipe[]> = {}
for (const r of RECIPES) {
  ;(BY_OUT[r.out] ||= []).push(r)
  if (!r.alt && !PRIMARY[r.out]) PRIMARY[r.out] = r
  const seen = new Set<string>()
  for (const [id] of r.in) if (!seen.has(id)) { seen.add(id); (USED_IN[id] ||= []).push(r) }
  if (r.steps) for (const s of r.steps) if (s.kept && s.item && !seen.has(s.item)) { seen.add(s.item); (USED_IN[s.item] ||= []).push(r) }
}
