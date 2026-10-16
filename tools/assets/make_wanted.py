#!/usr/bin/env python3
"""Build tools/assets/wanted.json: one entry per item in src/data/items.ts plus the extra blocks the 3D views use."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
src = open(os.path.join(ROOT, 'src', 'data', 'items.ts'), encoding='utf-8').read()
want = {}
SPECIAL = {
    'minecraft:chest': {'chest': True},
    'create:blaze_burner': {'model': 'create:item/blaze_burner'},
    'refinedstorage:controller': {'model': 'refinedstorage:block/controller/light_blue'},
    'create:belt_connector': {'model': 'create:item/belt_connector'},
    'fluid:creosote': {'tex': 'immersiveengineering:item/fluid_containers_bucket_creosote'},
    'fluid:redstone_acid': {'tex': 'immersiveengineering:block/fluid/redstone_acid_still'},
}
for m in re.finditer(r"^add\('([^']+)'(.*)$", src, re.M):
    iid, rest = m.group(1), m.group(2)
    t = re.search(r"tex: '([^']+)'", rest)
    key = iid
    if iid in SPECIAL:
        want[key] = SPECIAL[iid]; continue
    if t:
        ns, path = t.group(1).split('/', 1)
    elif iid.startswith('fluid:'):
        continue
    else:
        ns, path = iid.split(':', 1)
    want[key] = {'model': f'{ns}:item/{path}', 'alt': [f'{ns}:block/{path}']}
# finished rounds: flat icons from the TaCZ gun packs (src/data/ammo.ts)
ammo = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../src/data/ammo.ts')).read()
for m in re.finditer(r"^\s*std\('[^']+', '[^']+', '[^']+', '[^']+', '([^']+)'", ammo, re.M):
    want['tacz:ammo_' + m.group(1)] = {'tex': 'tacz:ammo/slot/' + m.group(1)}
for m in re.finditer(r"round: '([^']+)', roundTex: '([^']+)'", ammo):
    want[m.group(1)] = {'tex': m.group(2)}
# extra blocks for the 3D views (key "b:<name>")
EXTRA = {
    'b:shaft': 'create:block/shaft', 'b:cogwheel': 'create:block/cogwheel', 'b:large_cogwheel': 'create:block/large_cogwheel',
    'b:gearbox': 'create:item/gearbox', 'b:andesite_casing': 'create:block/andesite_casing', 'b:copper_casing': 'create:block/copper_casing',
    'b:deployer': 'create:item/deployer', 'b:press': 'create:item/mechanical_press', 'b:saw': 'create:item/mechanical_saw',
    'b:hopper': 'minecraft:block/hopper', 'b:stone': 'minecraft:block/stone', 'b:glass': 'minecraft:block/glass',
    'b:oak_log': 'minecraft:block/oak_log', 'b:white_wool': 'minecraft:block/white_wool', 'b:copper_block': 'minecraft:block/copper_block',
    'b:fluid_tank': 'create:block/fluid_tank/block_single_window', 'b:steam_engine': 'create:item/steam_engine',
    'b:burner_lit': 'create:item/blaze_burner', 'b:burner_empty': 'create:item/empty_blaze_burner',
    'b:pump': 'create:item/mechanical_pump', 'b:pipe': 'create:item/fluid_pipe', 'b:arm': 'create:item/mechanical_arm',
    'b:water_wheel': 'create:item/water_wheel', 'b:large_water_wheel': 'create:item/large_water_wheel', 'b:windmill_bearing': 'create:item/windmill_bearing',
    'b:alternator': 'createaddition:item/alternator', 'b:thermo': 'immersiveengineering:item/thermoelectric_generator',
    'b:huge_engine': 'createdieselgenerators:item/huge_diesel_engine', 'b:girder': 'create:item/metal_girder',
    'b:industrial_iron': 'create:block/industrial_iron_block', 'b:zinc_block': 'create:block/zinc_block', 'b:scaffold': 'create:item/andesite_scaffolding',
    'b:pumpjack_bearing': 'createdieselgenerators:item/pumpjack_bearing', 'b:pumpjack_head': 'createdieselgenerators:item/pumpjack_head',
    'b:pumpjack_hole': 'createdieselgenerators:item/pumpjack_hole', 'b:pumpjack_crank': 'createdieselgenerators:item/pumpjack_crank',
    'b:distill': 'createdieselgenerators:block/distillation_tank/block', 'b:reactor_casing': 'bigreactors:block/reactor/reinforced/casing_01_face',
    'b:reactor_controller': 'bigreactors:item/reinforced_reactorcontroller', 'b:reactor_port': 'bigreactors:item/reinforced_reactorpowertapfe_passive',
    'b:reactor_access': 'bigreactors:item/reinforced_reactorsolidaccessport', 'b:reactor_fuelrod': 'bigreactors:item/reinforced_reactorfuelrod',
    'b:reactor_controlrod': 'bigreactors:item/reinforced_reactorcontrolrod', 'b:lv_connector': 'immersiveengineering:item/connector_lv',
    'b:rolling_mill': 'createaddition:item/rolling_mill', 'b:magma': 'minecraft:block/magma_block', 'b:terracotta': 'minecraft:block/terracotta',
}
for k, v in EXTRA.items():
    want[k] = {'model': v}
want['b:belt_tex'] = {'tex': 'create:block/belt'}
want['b:belt_scroll'] = {'tex': 'create:block/belt_scroll'}
want['b:water_still'] = {'tex': 'minecraft:block/water_still'}
want['b:lava_still'] = {'tex': 'minecraft:block/lava_still'}
want['b:chest'] = {'chest': True}
# blockstates for the 3D views: key "s:<block>[props]"
STATES = [
    ('create:shaft', {'axis': a}) for a in 'xyz'] + [('create:cogwheel', {'axis': a}) for a in 'xyz'] + [('create:large_cogwheel', {'axis': a}) for a in 'xyz'] + [
    ('create:gearbox', {'axis': 'y'}),
    ('create:deployer', {'facing': 'down', 'axis_along_first': 'true'}),
    ('create:mechanical_press', {'facing': 'east'}),
    ('create:mechanical_saw', {'facing': 'up', 'axis_along_first': 'false', 'flipped': 'false'}),
    ('create:steam_engine', {'face': 'wall', 'facing': 'south', 'waterlogged': 'false'}), ('create:steam_engine', {'face': 'wall', 'facing': 'north', 'waterlogged': 'false'}),
    ('create:mechanical_arm', {'ceiling': 'false'}),
    ('create:windmill_bearing', {'facing': 'north'}),
    ('create:large_water_wheel', {'axis': 'x', 'extension': 'false'}),
    ('minecraft:hopper', {'facing': 'down', 'enabled': 'true'}),
    ('create:glass_fluid_pipe', {'axis': 'x', 'alt': 'false'}), ('create:glass_fluid_pipe', {'axis': 'y', 'alt': 'false'}), ('create:glass_fluid_pipe', {'axis': 'z', 'alt': 'false'}),
    ('create:fluid_tank', {'bottom': 'true', 'top': 'false', 'shape': 'window'}), ('create:fluid_tank', {'bottom': 'false', 'top': 'false', 'shape': 'window'}),
    ('create:fluid_tank', {'bottom': 'false', 'top': 'true', 'shape': 'window'}), ('create:fluid_tank', {'bottom': 'true', 'top': 'true', 'shape': 'window'}),
    ('createaddition:alternator', {'facing': 'south'}), ('createaddition:alternator', {'facing': 'north'}),
    ('createdieselgenerators:huge_diesel_engine', {'facing': 'south', 'powered': 'true'}), ('createdieselgenerators:huge_diesel_engine', {'facing': 'north', 'powered': 'true'}),
    ('createdieselgenerators:pumpjack_crank', {'facing': 'east'}),
    ('createdieselgenerators:pumpjack_bearing', {'facing': 'north'}), ('createdieselgenerators:pumpjack_bearing', {'facing': 'south'}),
    ('createdieselgenerators:pumpjack_head', {'facing': 'east', 'waterlogged': 'false'}),
    ('immersiveengineering:connector_lv', {'facing': 'north'}), ('immersiveengineering:connector_lv', {'facing': 'south'}),
] + [('create:mechanical_pump', {'facing': f}) for f in ('north', 'south', 'east', 'west', 'up', 'down')] + [(f'create:{m}_belt_funnel', {'facing': f, 'powered': 'false', 'shape': 'retracted', 'waterlogged': 'false'}) for m in ('andesite', 'brass') for f in ('north', 'south', 'east', 'west')]
import itertools
for bits in itertools.product(['false', 'true'], repeat=6):
    STATES.append(('create:fluid_pipe', dict(zip(['north', 'south', 'east', 'west', 'up', 'down'], bits))))
def skey(b, p): return 's:' + b + '[' + ','.join(f'{k}={v}' for k, v in sorted(p.items())) + ']'
for b, p in STATES:
    want[skey(b, p)] = {'state': b, 'props': p}
# animated parts (block-space partial models)
for ref in ['create:block/shaft_half', 'create:block/deployer/pole', 'create:block/deployer/hand_holding', 'create:block/mechanical_press/head',
            'create:block/mechanical_saw/blade_vertical_active', 'create:block/mechanical_pump/cog', 'create:block/steam_engine/piston',
            'create:block/steam_engine/linkage', 'create:block/steam_engine/shaft_connector', 'create:block/mechanical_arm/base',
            'create:block/mechanical_arm/lower_body', 'create:block/mechanical_arm/upper_body', 'create:block/mechanical_arm/claw_base',
            'create:block/mechanical_arm/upper_claw_grip', 'create:block/mechanical_arm/lower_claw_grip', 'create:block/mechanical_arm/cog',
            'create:block/bearing/top_wooden', 'create:block/belt_pulley',
            'create:block/belt/start', 'create:block/belt/middle', 'create:block/belt/end', 'create:block/belt/start_bottom',
            'create:block/belt/middle_bottom', 'create:block/belt/end_bottom', 'create:block/blaze_burner/blaze/active',
            'createdieselgenerators:block/huge_diesel_engine/piston', 'createdieselgenerators:block/huge_diesel_engine/linkage',
            'createdieselgenerators:block/huge_diesel_engine/shaft_connector', 'createdieselgenerators:block/pumpjack_crank/small_counterweight',
            'createdieselgenerators:block/pumpjack_crank/small_rod', 'createdieselgenerators:block/powered_engine_shaft']:
    want['m:' + ref] = {'model': ref}
# fluid pipe end pieces (Create adds these in code: PipeAttachmentModel)
for kind in ('connection', 'rim_connector', 'rim', 'drain'):
    for d in ('north', 'south', 'east', 'west', 'up', 'down'):
        want[f'm:create:block/fluid_pipe/{kind}/{d}'] = {'model': f'create:block/fluid_pipe/{kind}/{d}'}
json.dump(want, open(os.path.join(HERE, 'wanted.json'), 'w'), indent=1)
print(len(want), 'entries')
