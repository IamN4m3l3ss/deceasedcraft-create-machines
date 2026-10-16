import type { Table } from './builds'

export interface Tier { tier: 'Early' | 'Mid' | 'Late'; title: string; value: string; icon: string; points: string[]; links: { to: string; label: string }[] }
export interface Flow { title: string; note: string; rows: { from: string[]; via: string; to: string; label: string }[] }
export interface Section {
  eyebrow: string; title: string; intro: string; icon: string
  tiers?: Tier[]; flows?: Flow[]; tables?: Table[]
  callouts?: { title: string; body: string; tone?: 'info' | 'warn' | 'ok' }[]
}

export const SECTIONS: Record<'production' | 'kinetic' | 'electric', Section> = {
  production: {
    eyebrow: 'Ammo & gun parts', title: 'Production lines', icon: 'create:deployer',
    intro: 'Two production builds for the pack’s own sequenced-assembly recipes and two supply lines. They’re kept small because every deployer in this pack costs an IE Electronic Component. The ammo line, parts ring and Metalworks use 8 deployers and about 2,000 SU at 32 RPM, which one 64-sail windmill covers.',
    flows: [
      { title: 'Ammo', note: 'Then the ammo line: 2 deployers make 9mm, .45 ACP and the other standard calibers, plus .50 BMG and 40mm; a third deployer adds 37mm shells.', rows: [
        { from: ['minecraft:copper_ingot', 'create:zinc_ingot'], via: 'Alloy Kiln', to: 'create:brass_ingot', label: '2 brass per pair' },
        { from: ['create:brass_ingot'], via: 'IE Metal Press + mold', to: 'deceasedcraft:bullet_casing_9mm_round', label: '4 casings per ingot' },
        { from: ['minecraft:gunpowder'], via: 'craft', to: 'createbigcannons:gunpowder_pinch', label: '4 pinches' },
        { from: ['immersiveengineering:ingot_lead'], via: 'craft', to: 'immersiveengineering:nugget_lead', label: '9 nuggets' },
      ] },
      { title: 'Gun parts', note: 'Then the parts ring: 6 deployers make all 7 gun-part kits and the attachment parts.', rows: [
        { from: ['immersiveengineering:plate_steel'], via: 'Metalworks', to: 'createbigcannons:recoil_spring', label: '3 springs per plate' },
        { from: ['immersiveengineering:ingot_steel'], via: 'Rolling Mill', to: 'immersiveengineering:stick_steel', label: '2 rods per ingot' },
        { from: ['immersiveengineering:plate_steel', 'minecraft:copper_ingot'], via: 'IE Workbench', to: 'immersiveengineering:component_steel', label: '2 plates + 1 copper' },
        { from: ['minecraft:paper', 'minecraft:slime_ball'], via: 'craft', to: 'apocalypsenow:cardboard_box', label: '8 paper + 1 slimeball' },
      ] },
    ],
    callouts: [{ title: 'Powering these builds', body: 'The ammo line needs 8 SU per RPM, the parts ring 24, the Metalworks 28 and the rolling mill 4: about 2,000 SU at 32 RPM. One 64-sail windmill covers all of it. The IE Metal Press that makes casings runs on electricity: a small thermoelectric row is enough.', tone: 'info' }],
  },
  kinetic: {
    eyebrow: 'Stress units (SU) for Create', title: 'Rotational power', icon: 'create:cogwheel',
    intro: 'From a free windmill to a 327,680 SU diesel plant. The SU a source gives doesn’t change when you gear it up or down, only its speed does. So pick by total SU, then gear to the RPM your machines want.',
    tiers: [
      { tier: 'Early', title: 'Wind and water', value: '4,096 SU', icon: 'create:white_sail', points: ['64-sail windmill: 512 SU per RPM, 8 RPM, no fuel.', 'Large water wheel: 512 SU for 16 planks and a shaft.', 'Skip the small wheel: the pack cuts it to 128 SU.'], links: [{ to: '/build/windmill', label: 'Windmill' }, { to: '/build/wheels', label: 'Water wheels' }] },
      { tier: 'Mid', title: 'Coal boiler', value: '65,536 SU', icon: 'create:steam_engine', points: ['16,384 SU per boiler level; level 4 burns 180 coal an hour.', 'One level costs about 17 copper and 1 gold.', 'The most SU for your resources anywhere in the pack.'], links: [{ to: '/build/boiler4', label: 'Coal boiler' }] },
      { tier: 'Late', title: 'Max boiler or diesel', value: '≈ 300,000 SU', icon: 'createdieselgenerators:huge_diesel_engine', points: ['Level 18 boiler on blaze cakes: 294,912 SU. Cheaper to build.', '20 huge diesel engines: 327,680 SU. Smaller, no water or burner feeding, needs an oil chunk.'], links: [{ to: '/build/boiler18', label: 'Max boiler' }, { to: '/build/diesel', label: 'Diesel plant' }] },
    ],
    callouts: [
      { title: 'No lake needed: use a 2×2 pool', body: 'Dig a 2×2 hole and fill it with two water buckets in opposite corners. Put an open pipe end into one of the water blocks and pump from it. When a pipe drains a source block that vanilla would refill straight away, Create leaves the block in place, so the pool never empties. This works in the middle of a city. A pump moves half its RPM in mB per tick (128 mB/t at 256 RPM); each boiler level needs 10 mB/t. A hose pulley only gives endless water in a body of 10,000+ blocks.', tone: 'ok' },
    ],
    tables: [
      { title: 'Every source side by side', head: ['Source', 'SU', 'Running cost', 'Main build cost'], highlight: [3, 5, 9], rows: [
        ['Small water wheel', '128', 'free', '8 planks, shaft (cut by the pack)'],
        ['Large water wheel', '512', 'free', '16 planks, shaft'],
        ['Passive boiler', '2,048', 'free', '1 engine, 4 tanks, campfire, pump'],
        ['Windmill, 64 sails', '4,096', 'free', '32 wool, 64 sticks, 32 andesite alloy, bearing, glue'],
        ['Windmill, 128 sails (cap)', '8,192', 'free', '64 wool, 128 sticks, 64 andesite alloy'],
        ['Coal boiler, level 4', '65,536', '180 coal/h', '4 engines, 16 tanks, 4 burners'],
        ['Coal boiler, level 9', '147,456', '405 coal/h', '9 engines, 36 tanks, 9 burners'],
        ['Modular diesel stack, 21 blocks', '172,032', '75.6 buckets/h', '21 modular engines'],
        ['Electric motor (Crafts & Additions)', '8,192', '240 FE/t', 'mechanical-crafter recipe, plus a power source'],
        ['Cake boiler, level 18', '294,912', '≈ 200 blaze cakes/h', '18 engines, 72 tanks, 9 burners'],
        ['Diesel plant, 20 huge engines', '327,680', '72 buckets/h', '20 huge engines (180 precision mechanisms)']],
        note: 'Highlighted rows are the best value for their stage. Engines burn 1 mB per second per engine block. Gasoline gives about ¾ of diesel’s SU in modular and huge engines.' },
    ],
  },
  electric: {
    eyebrow: 'Forge Energy (FE) for IE and Crafts & Additions', title: 'Electricity', icon: 'createaddition:capacitor',
    intro: 'You need electricity for the IE Metal Press that makes bullet casings, and for most IE and Refined Storage machines. The cheapest source in this pack has no moving parts and no fuel: a thermoelectric generator between something hot and something cold.',
    tiers: [
      { tier: 'Early', title: 'Thermoelectric row', value: '62 FE/t each', icon: 'immersiveengineering:thermoelectric_generator', points: ['3 steel, 5 constantan plates and 1 LV coil each.', 'Lava and water are never used up.', '8 generators: about 500 FE/t, enough for the Metal Press.'], links: [{ to: '/build/thermo', label: 'Thermoelectric row' }] },
      { tier: 'Mid', title: 'Alternators on the boiler', value: '1,440 FE/t', icon: 'createaddition:alternator', points: ['180 FE/t per alternator at 256 RPM, 8,192 SU each.', 'A level 4 boiler runs 8.', 'Fuel-free option: 20 thermoelectrics give 1,240 FE/t.'], links: [{ to: '/build/altbank', label: 'Alternator bank' }] },
      { tier: 'Late', title: 'Big banks and reactors', value: '14,400 FE/t', icon: 'bigreactors:reinforced_reactorcasing', points: ['36 alternators on the max boiler.', 'Uranium blocks are 2000 K: 41 FE/t per pair against water.', 'Extreme Reactor once Refined Storage is up: 3,600 FE/t (5³), 12,500 (7³), 14,400 with a turbine.'], links: [{ to: '/build/bigbank', label: 'Big bank' }, { to: '/build/reactor', label: 'Reactor' }] },
    ],
    callouts: [
      { title: 'The one formula to know', body: 'A thermoelectric generator gives √(temperature difference) FE/t for every pair of opposite faces where one side is hot and the other cold. That’s with the pack’s ×2 setting. Lava is 1300 K and water 300 K: √1000 ≈ 31 FE/t per pair, up to 3 pairs per generator.', tone: 'info' },
      { title: 'Skip the IE Diesel Generator for steady power', body: 'It gives 8,192 FE/t with the pack’s settings but burns 80 mB of biodiesel every second.', tone: 'warn' },
    ],
    tables: [
      { title: 'Every source side by side', head: ['Source', 'FE/t', 'Runs on', 'Notes'], highlight: [2, 6, 7], rows: [
        ['IE windmill + kinetic dynamo', '≈ 47', 'wind', '8 sails, 7 clear blocks in front, clear weather'],
        ['Thermoelectric, 1 pair (lava / water)', '31', 'nothing', '3 steel, 5 constantan plates, 1 LV coil'],
        ['Thermoelectric, 2 pairs (row build)', '62', 'nothing', 'the row build'],
        ['Thermoelectric, 3 pairs', '93', 'nothing', 'hot/cold on all three axes'],
        ['Thermoelectric, uranium / water, 3 pairs', '123', 'nothing', 'uranium blocks are never used up'],
        ['Alternator on a 64-sail windmill', '90', 'wind', '4,096 SU runs it at 128 RPM'],
        ['8 alternators on a level 4 boiler', '1,440', '180 coal/h', 'uses the whole 65,536 SU'],
        ['36 alternators on the max boiler', '6,480', '≈ 200 blaze cakes/h', 'uses 294,912 SU'],
        ['IE Diesel Generator', '8,192', '80 mB/s biodiesel', 'pack config doubles the output; fuel use is huge'],
        ['Extreme Reactor 5³ / 7³ passive', '3,600 / 12,500', '6.6 / 21 uranium ingots/h', 'needs Refined Storage parts in this pack'],
        ['Extreme Reactor 5³ + turbine', '14,400', '5.7 uranium ingots/h', '+ 48 electrum blocks for the coil']] },
      { title: 'Storing it', head: ['Storage', 'Capacity', 'Notes'], rows: [
        ['Crafts & Additions accumulator', '2,048,000 FE per block', 'Blocks join up to 3 wide and 5 tall (45 blocks, ≈ 92 million FE). 512 FE/t in and out.'],
        ['IE LV / MV / HV capacitor', '1M / 4M / 8M FE', 'Good next to the Metal Press so it keeps running at night when the windmill slows down.']] },
    ],
  },
}
