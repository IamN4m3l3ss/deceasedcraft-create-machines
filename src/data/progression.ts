// The order to build things in, following the pack's questbook (Technology chapters: Steels, Power
// Generation, Refined Storage, Bullet Automation, Machinery; Combat: Guns). Each stage says what the
// questbook asks for, which builds on this site cover it, and what else you need from other mods.

export interface Stage {
  n: number
  tier: 'Early' | 'Mid' | 'Late'
  title: string
  chapter: string
  goal: string
  /** builds on this site, with an optional version */
  builds: { id: string; v?: string; why: string }[]
  /** what the questbook asks for here (icons) */
  quest: string[]
  /** other machines you need that aren't Create builds */
  other: { name: string; icon: string; note: string }[]
  tip?: string
}

export const STAGES: Stage[] = [
  {
    n: 1, tier: 'Early', title: 'First rotation', chapter: 'Power Generation',
    goal: 'Get Create running: andesite alloy, shafts and cogs, and something that turns them.',
    builds: [
      { id: 'wheels', why: 'Three large water wheels: 1,536 SU for planks.' },
      { id: 'windmill', why: '4,096 SU from wind. Enough for every production line here.' },
    ],
    quest: ['create:water_wheel', 'create:large_water_wheel', 'create:windmill_bearing', 'create:white_sail', 'create:andesite_alloy'],
    other: [],
    tip: 'Skip the small water wheel: the pack cuts it to 128 SU.',
  },
  {
    n: 2, tier: 'Early', title: 'Steel', chapter: 'Steels',
    goal: 'Almost everything after this point eats steel: gun parts, deployers’ components, reactor casings.',
    builds: [
      { id: 'metal', why: 'Steel plates, recoil springs and rods from steel ingots.' },
    ],
    quest: ['immersiveengineering:blastbrick', 'immersiveengineering:coal_coke', 'immersiveengineering:ingot_steel', 'immersiveengineering:plate_steel'],
    other: [
      { name: 'Coke Oven (IE)', icon: 'immersiveengineering:cokebrick', note: 'Coal → coal coke + creosote. Creosote makes treated wood.' },
      { name: 'Blast Furnace (IE)', icon: 'immersiveengineering:blastbrick', note: 'Iron + coal coke → steel, 60 s an ingot. Build 2–3 side by side.' },
    ],
  },
  {
    n: 3, tier: 'Early', title: 'Electricity for IE', chapter: 'Power Generation',
    goal: 'The IE Metal Press (bullet casings), Crusher (saltpeter) and Workbench machines need FE.',
    builds: [
      { id: 'thermo', why: 'No fuel at all: lava and water. 496 FE/t covers a metal press and a crusher.' },
    ],
    quest: ['immersiveengineering:thermoelectric_generator', 'createaddition:alternator'],
    other: [],
  },
  {
    n: 4, tier: 'Early', title: 'Bullets', chapter: 'Bullet Automation',
    goal: 'The questbook’s path: survey for ore veins, brass from copper and zinc, gunpowder from saltpeter, sulfur and charcoal, then casings and rounds.',
    builds: [
      { id: 'sand', why: 'Sand for sandstone (saltpeter) and glass. Needs nothing but rotation.' },
      { id: 'ammo', v: 'starter', why: 'Start hand-fed with 2 deployers.' },
      { id: 'ammo', why: 'Then add chests and funnels: 9mm and .45 ACP on autopilot.' },
    ],
    quest: ['immersiveengineering:survey_tools', 'create:brass_ingot', 'immersiveengineering:dust_saltpeter', 'immersiveengineering:dust_sulfur', 'minecraft:charcoal', 'minecraft:gunpowder', 'immersiveengineering:nugget_lead', 'deceasedcraft:bullet_casing_9mm_round', 'tacz:ammo_9mm'],
    other: [
      { name: 'Alloy Kiln (IE)', icon: 'immersiveengineering:alloybrick', note: 'Copper + zinc → 2 brass. No power, burns coal. The cheapest brass there is.' },
      { name: 'Metal Press (IE)', icon: 'immersiveengineering:plate_steel', note: 'Brass + caliber mold → 4 casings. Molds come from loot and traders.' },
      { name: 'Crusher (IE)', icon: 'minecraft:sandstone', note: 'Sandstone → 2 sand + ½ saltpeter; blaze rod → 4 blaze powder + ½ sulfur.' },
      { name: 'Excavator (IE)', icon: 'immersiveengineering:survey_tools', note: 'Mines a mineral vein forever: galena for lead, sphalerite for zinc.' },
    ],
    tip: 'Gunpowder: 4 saltpeter + 1 sulfur + 1 charcoal → 6 gunpowder (crafting). One gunpowder = 4 pinches = 4 rounds.',
  },
  {
    n: 5, tier: 'Mid', title: 'Guns', chapter: 'Guns',
    goal: 'Gun-part kits: a cardboard box looped through six deployers. Needs the steel parts from stage 2 and the steel mechanical components from the IE Workbench.',
    builds: [
      { id: 'ring', why: 'All 8 kits on one looping belt.' },
    ],
    quest: ['tacz:gun_smith_table', 'immersiveengineering:component_steel', 'deceasedcraft:pistol_assembly_parts', 'deceasedcraft:rifle_assembly_parts', 'deceasedcraft:attachment_assembly_parts'],
    other: [
      { name: 'Engineer’s Workbench (IE)', icon: 'immersiveengineering:component_steel', note: 'Components blueprint: 2 steel plates + 1 copper → 1 steel component.' },
    ],
  },
  {
    n: 6, tier: 'Mid', title: 'Real power', chapter: 'Power Generation',
    goal: 'A coal boiler gives 16 times the windmill. Put alternators on it for FE.',
    builds: [
      { id: 'boiler4', why: '65,536 SU on 180 coal an hour.' },
      { id: 'altbank', why: 'Turns that into 1,440 FE/t.' },
    ],
    quest: ['create:steam_engine', 'create:goggles', 'createaddition:alternator'],
    other: [],
  },
  {
    n: 7, tier: 'Late', title: 'Refined Storage', chapter: 'Refined Storage',
    goal: 'Silicon, processors and the RS controller. Every reactor and turbine casing needs an RS machine casing, so this comes before nuclear.',
    builds: [],
    quest: ['refinedstorage:silicon', 'refinedstorage:advanced_processor', 'refinedstorage:machine_casing', 'refinedstorage:controller'],
    other: [
      { name: 'Arc Furnace (IE)', icon: 'refinedstorage:silicon', note: 'Silicon from silica dust (sandstone in the crusher gives it) and coal coke.' },
      { name: 'Refinery and plastics (IE)', icon: 'immersiveengineering:plate_duroplast', note: 'Duroplast plates for the machine casings: phenolic resin from acetaldehyde.' },
    ],
  },
  {
    n: 8, tier: 'Late', title: 'Big power', chapter: 'Power Generation · Machinery',
    goal: 'Either a level 18 boiler on blaze cakes or a diesel plant on an oil chunk, then a big alternator bank.',
    builds: [
      { id: 'sand', v: 'gravel', why: 'Gravel → netherrack (spout lava on it) → cinder flour for blaze cakes.' },
      { id: 'boiler18', why: '294,912 SU on blaze cakes.' },
      { id: 'diesel', why: '327,680 SU from 20 huge diesel engines.' },
      { id: 'bigbank', why: '6,480 FE/t from 36 alternators.' },
    ],
    quest: ['createdieselgenerators:diesel_engine', 'createdieselgenerators:huge_diesel_engine', 'create:blaze_cake'],
    other: [],
  },
  {
    n: 9, tier: 'Late', title: 'Nuclear', chapter: 'Power Generation',
    goal: 'The questbook ends with reactor casing, fuel rods, control rods, controller, access port, both power ports and the turbine casing.',
    builds: [
      { id: 'reactor', v: 'starter', why: '5×5×5 passive: 3,600 FE/t.' },
      { id: 'reactor', why: '7×7×7 passive: 12,500 FE/t.' },
      { id: 'reactor', v: 'turbine', why: 'The starter reactor plus a turbine: 14,400 FE/t on a quarter of the uranium.' },
    ],
    quest: ['immersiveengineering:ingot_uranium', 'immersiveengineering:graphite_electrode', 'bigreactors:reinforced_reactorcasing', 'bigreactors:reinforced_reactorfuelrod', 'bigreactors:reinforced_reactorcontrolrod', 'bigreactors:reinforced_reactorcontroller', 'bigreactors:reinforced_reactorpowertapfe_active', 'bigreactors:reinforced_turbinecasing'],
    other: [],
  },
]
