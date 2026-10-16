export interface Station {
  id: string
  name: string
  /** item used as the station's icon */
  icon: string
  /** one line: what the station is and how to run it */
  how: string
  group: 'Hand' | 'Create' | 'Immersive Engineering' | 'Other mods'
}

const S: Station[] = [
  { id: 'crafting', name: 'Crafting Table', icon: 'minecraft:crafting_table', how: 'Normal 3×3 crafting.', group: 'Hand' },
  { id: 'smelting', name: 'Furnace', icon: 'minecraft:cobblestone', how: 'Any furnace or blast furnace.', group: 'Hand' },
  { id: 'stonecutting', name: 'Stonecutter', icon: 'minecraft:stone', how: 'Vanilla stonecutter.', group: 'Hand' },
  { id: 'capture', name: 'Capture', icon: 'create:empty_blaze_burner', how: 'Right-click a Blaze (or blaze spawner) with an Empty Blaze Burner.', group: 'Hand' },
  { id: 'item_application', name: 'Item Application', icon: 'create:andesite_casing', how: 'Place the first item as a block, then right-click it holding the second (a Deployer can do it too).', group: 'Create' },
  { id: 'pressing', name: 'Mechanical Press', icon: 'create:mechanical_press', how: 'A Mechanical Press over a Depot or a belt.', group: 'Create' },
  { id: 'cutting', name: 'Mechanical Saw', icon: 'create:mechanical_saw', how: 'Saw facing up, items on a belt or thrown on top. Use a filter when there are two recipes.', group: 'Create' },
  { id: 'milling', name: 'Millstone or Crushing Wheels', icon: 'create:crushing_wheel', how: 'A millstone, or a pair of crushing wheels spinning inward. Drop items in from above.', group: 'Create' },
  { id: 'crushing', name: 'Crushing Wheels', icon: 'create:crushing_wheel', how: 'Two crushing wheels with a one-block gap, spinning toward each other. Drop items into the gap.', group: 'Create' },
  { id: 'mixing', name: 'Mixer + Basin', icon: 'create:mechanical_mixer', how: 'Mechanical Mixer over a Basin.', group: 'Create' },
  { id: 'mixing_heated', name: 'Mixer + Basin, heated', icon: 'create:blaze_burner', how: 'Mixer over a Basin on a Blaze Burner fed with normal fuel.', group: 'Create' },
  { id: 'mixing_superheated', name: 'Mixer + Basin, superheated', icon: 'create:blaze_cake', how: 'Mixer over a Basin on a Blaze Burner fed a Blaze Cake.', group: 'Create' },
  { id: 'compacting', name: 'Press + Basin', icon: 'create:basin', how: 'Mechanical Press over a Basin.', group: 'Create' },
  { id: 'filling', name: 'Spout', icon: 'create:spout', how: 'Spout over a depot or belt, fed by a pipe or tank.', group: 'Create' },
  { id: 'sequenced_assembly', name: 'Sequenced Assembly', icon: 'create:deployer', how: 'The item rides a belt past machines that do these steps in order. “Repeat × 3” means it has to pass them 3 times.', group: 'Create' },
  { id: 'mechanical_crafting', name: 'Mechanical Crafters', icon: 'create:mechanical_crafter', how: 'One Mechanical Crafter per filled slot, laid out in the recipe’s shape, with power.', group: 'Create' },
  { id: 'ie_workbench', name: 'Engineer’s Workbench', icon: 'immersiveengineering:treated_wood_horizontal', how: 'IE workbench with the matching blueprint in its slot (the blueprint is not used up).', group: 'Immersive Engineering' },
  { id: 'ie_alloy_kiln', name: 'Alloy Kiln', icon: 'minecraft:terracotta', how: 'IE Alloy Kiln (multiblock of kiln bricks). Runs on any furnace fuel, no power.', group: 'Immersive Engineering' },
  { id: 'ie_blast_furnace', name: 'Blast Furnace (IE)', icon: 'minecraft:netherrack', how: 'IE crude blast furnace. Runs on coal coke, 60 s per ingot.', group: 'Immersive Engineering' },
  { id: 'ie_crusher', name: 'Crusher (IE)', icon: 'minecraft:sandstone', how: 'IE Crusher multiblock. Needs power; items go in the top, results come out the front.', group: 'Immersive Engineering' },
  { id: 'ie_metal_press', name: 'Metal Press', icon: 'immersiveengineering:plate_steel', how: 'IE Metal Press multiblock with a mold. Needs power (2,400 FE per press).', group: 'Immersive Engineering' },
  { id: 'rolling', name: 'Rolling Mill', icon: 'createaddition:rolling_mill', how: 'Crafts & Additions Rolling Mill with rotation. Hopper in, hopper out.', group: 'Other mods' },
]

export const STATIONS: Record<string, Station> = Object.fromEntries(S.map((s) => [s.id, s]))
export function station(id: string): Station {
  return STATIONS[id] || { id, name: id, icon: 'minecraft:crafting_table', how: '', group: 'Other mods' }
}
