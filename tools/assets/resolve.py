#!/usr/bin/env python3
"""Resolve Minecraft JSON models for the items and blocks this site shows.

Reads the asset folders of vanilla and the mods (see ROOTS), follows each model's parent chain,
and writes:
  public/mc/models.json   resolved models: cuboid elements with texture refs + GUI transform,
                          or a list of flat layers for item/generated models
  public/mc/tex/...       every texture used, cut to its first animation frame

tools/assets/render_icons.mjs then turns these into the item icons, and the 3D viewer builds
its blocks from the same file.

Asset sources are the mods' public GitHub repos and a vanilla asset mirror; set ROOTS below or the
ASSET_BASE environment variable to where you cloned them.
"""
import json, os, re, sys, shutil, struct, zlib

BASE = os.environ.get('ASSET_BASE', '/home/claude')
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, 'public', 'mc')

ROOTS = {
    'minecraft': ['mc-assets/assets/minecraft'],
    'create': ['create-src/src/main/resources/assets/create', 'create-src/src/generated/resources/assets/create'],
    'immersiveengineering': ['ie-src/src/main/resources/assets/immersiveengineering', 'ie-src/src/generated/resources/assets/immersiveengineering'],
    'createaddition': ['cca-src/src/main/resources/assets/createaddition', 'cca-src/src/generated/resources/assets/createaddition'],
    'createdieselgenerators': ['cdg-src/src/main/resources/assets/createdieselgenerators', 'cdg-src/src/generated/resources/assets/createdieselgenerators'],
    'createbigcannons': ['cbc-src/src/main/resources/assets/createbigcannons', 'cbc-src/forge/src/generated/resources/assets/createbigcannons'],
    'bigreactors': ['er-src/src/main/resources/assets/bigreactors', 'er-src/src/generated/resources/assets/bigreactors'],
    'refinedstorage': ['rs-src/src/main/resources/assets/refinedstorage', 'rs-src/src/generated/resources/assets/refinedstorage'],
    'tacz': ['pack/x/overrides/tacz/tacz_default_gun/assets/tacz'],
}


def find(ns, rel):
    for r in ROOTS.get(ns, []):
        p = os.path.join(BASE, r, rel)
        if os.path.isfile(p):
            return p
    return None


def split(ref, default_ns='minecraft'):
    if ':' in ref:
        return ref.split(':', 1)
    return default_ns, ref


def load_model(ref):
    ns, path = split(ref)
    p = find(ns, f'models/{path}.json')
    if not p:
        return None
    return json.load(open(p, encoding='utf-8'))


GUI_DEFAULT = {'rotation': [30, 225, 0], 'translation': [0, 0, 0], 'scale': [0.625, 0.625, 0.625]}


def resolve(ref):
    """Follow the parent chain. Returns dict with textures, elements, gui, kind."""
    textures, elements, gui, chain, obj = {}, None, None, [], None
    cur = ref
    for _ in range(20):
        m = load_model(cur)
        if m is None:
            return None, chain
        chain.append(cur)
        for k, v in (m.get('textures') or {}).items():
            textures.setdefault(k, v)
        if elements is None and obj is None and 'elements' in m:
            elements = m['elements']
        if obj is None and elements is None and m.get('loader') == 'forge:obj' and m.get('model'):
            obj = {'model': m['model'], 'flip_v': bool(m.get('flip_v'))}
        if gui is None and 'display' in m and 'gui' in m['display']:
            gui = m['display']['gui']
        par = m.get('parent')
        if not par:
            break
        pns, ppath = split(par)
        if ppath in ('item/generated', 'item/handheld', 'builtin/generated'):
            layers = []
            i = 0
            while f'layer{i}' in textures:
                layers.append(textures[f'layer{i}']); i += 1
            return {'kind': 'flat', 'layers': [deref(l, textures) for l in layers]}, chain
        if ppath == 'builtin/entity':
            return {'kind': 'entity'}, chain
        if pns == 'minecraft' and ppath == 'block/block' and elements is None and gui is None:
            gui = GUI_DEFAULT
        cur = par
    if obj:
        return {'kind': 'obj', 'textures': textures, 'obj': obj, 'gui': gui or GUI_DEFAULT}, chain
    if not elements:
        return None, chain
    return {'kind': 'model', 'textures': textures, 'elements': elements, 'gui': gui or GUI_DEFAULT}, chain


def deref(v, textures, depth=0):
    while isinstance(v, str) and v.startswith('#') and depth < 10:
        v = textures.get(v[1:], v); depth += 1
    return v


def tex_file(ref):
    ns, path = split(ref)
    return find(ns, f'textures/{path}.png')


# --- minimal PNG first-frame cropper (no PIL needed) ---
def png_size(data):
    return struct.unpack('>II', data[16:24])


def copy_texture(ref, used):
    if ref in used:
        return used[ref]
    src = tex_file(ref)
    if not src:
        used[ref] = None
        return None
    ns, path = split(ref)
    dst_rel = f'tex/{ns}/{path}.png'
    dst = os.path.join(OUT, dst_rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)
    w, h = png_size(open(src, 'rb').read(32))
    used[ref] = {'p': dst_rel, 'w': w, 'h': h}
    return used[ref]


def pack_obj(model, used):
    ns, path = split(model['obj']['model'])
    src = find(ns, path)
    if not src:
        return None
    mtl_src = src[:-4] + '.mtl'
    mats = {}
    if os.path.isfile(mtl_src):
        cur = None
        for line in open(mtl_src, encoding='utf-8'):
            parts = line.strip().split(None, 1)
            if not parts: continue
            if parts[0] == 'newmtl': cur = parts[1]
            elif parts[0] == 'map_Kd' and cur:
                ref = deref(parts[1].strip(), model['textures'])
                if isinstance(ref, str) and not ref.startswith('#'):
                    ref = ref if ':' in ref else 'minecraft:' + ref
                    t = copy_texture(ref, used)
                    if t: mats[cur] = t['p'] + ('|' + str(t['w'] / t['h']) if t['h'] > t['w'] else '')
    dst_rel = f'obj/{ns}/{os.path.basename(path)}'
    os.makedirs(os.path.join(OUT, os.path.dirname(dst_rel)), exist_ok=True)
    # strip comments/normals to keep it small
    keep = [l for l in open(src, encoding='utf-8') if l[:2] in ('v ', 'vt', 'f ', 'us', 'o ', 'g ')]
    open(os.path.join(OUT, dst_rel), 'w').write(''.join(keep))
    return {'obj': dst_rel, 'mats': mats, 'flipV': model['obj']['flip_v'], 'gui': model['gui']}


def pack(model, used):
    """Turn a resolved model into the compact form the site uses."""
    if model['kind'] == 'obj':
        return pack_obj(model, used)
    if model['kind'] == 'flat':
        layers = []
        for l in model['layers']:
            t = copy_texture(l if ':' in l else 'minecraft:' + l, used)
            if t: layers.append(t['p'])
        return {'flat': layers} if layers else None
    tx = model['textures']
    els = []
    for e in model['elements']:
        faces = {}
        for d, f in e.get('faces', {}).items():
            ref = deref(f.get('texture', ''), tx)
            if not isinstance(ref, str) or ref.startswith('#'):
                continue
            ref = ref if ':' in ref else 'minecraft:' + ref
            t = copy_texture(ref, used)
            if not t:
                continue
            face = {'t': t['p']}
            if 'uv' in f: face['uv'] = f['uv']
            if f.get('rotation'): face['r'] = f['rotation']
            if t['h'] > t['w']: face['a'] = t['w'] / t['h']  # animated strip: use the first frame
            faces[d] = face
        if not faces:
            continue
        el = {'f': e['from'], 't': e['to'], 'faces': faces}
        if e.get('rotation'):
            r = e['rotation']
            el['rot'] = {'o': r.get('origin', [8, 8, 8]), 'ax': r['axis'], 'a': r['angle'], 'rs': bool(r.get('rescale'))}
        if e.get('shade') is False:
            el['ns'] = 1
        els.append(el)
    if not els:
        return None
    return {'el': els, 'gui': model['gui']}


def chest_model():
    """Vanilla chests are entity-rendered; rebuild one from the entity texture (64x64, uv units /4)."""
    T = 'tex/minecraft/entity/chest/normal.png'
    def box(fr, to, u, v, w, h, d, flipy=True):
        s = 0.25 * 16 / 16 * 4  # entity texels -> model uv units (64px texture mapped to 0..16)
        k = 16 / 64
        def r(x, y, ww, hh): return [x * k, y * k, (x + ww) * k, (y + hh) * k]
        return {'f': fr, 't': to, 'faces': {
            'up': {'t': T, 'uv': r(u + d + w, v, w, d)},
            'down': {'t': T, 'uv': r(u + d, v, w, d)},
            'north': {'t': T, 'uv': r(u + d + w + d, v + d, w, h)},
            'south': {'t': T, 'uv': r(u + d, v + d, w, h)},
            'west': {'t': T, 'uv': r(u, v + d, d, h)},
            'east': {'t': T, 'uv': r(u + d + w, v + d, d, h)},
        }}
    return {'el': [box([1, 0, 1], [15, 10, 15], 0, 19, 14, 10, 14), box([1, 10, 1], [15, 14, 15], 0, 0, 14, 4, 14), box([7, 7, 15], [9, 11, 16], 0, 0, 2, 4, 1)], 'gui': GUI_DEFAULT}


def main():
    want = json.load(open(os.path.join(os.path.dirname(__file__), 'wanted.json')))
    used, models, report = {}, {}, []
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    for key, spec in want.items():
        # spec: {"model": "ns:item/x"} or {"model": ...,"alt": [...]} or {"tex": "ns:path"} (flat texture) or {"chest": true}
        if spec.get('chest'):
            copy_texture('minecraft:entity/chest/normal', used)
            models[key] = chest_model(); report.append((key, 'chest')); continue
        if 'tex' in spec:
            t = copy_texture(spec['tex'], used)
            if t:
                models[key] = {'flat': [t['p']]}; report.append((key, 'tex'))
            else:
                report.append((key, 'MISSING tex ' + spec['tex']))
            continue
        got = None
        for ref in [spec['model']] + spec.get('alt', []):
            m, chain = resolve(ref)
            if m and m['kind'] != 'entity':
                got = pack(m, used)
                if got:
                    break
        if got:
            models[key] = got; report.append((key, 'flat' if 'flat' in got else ('obj' if 'obj' in got else f"{len(got['el'])} el")))
        else:
            report.append((key, 'MISSING ' + spec['model']))
    json.dump(models, open(os.path.join(OUT, 'models.json'), 'w'), separators=(',', ':'))
    miss = [r for r in report if r[1].startswith('MISSING')]
    for k, v in report:
        if '-v' in sys.argv or v.startswith('MISSING'):
            print(f'{k:60s} {v}')
    print(f'{len(models)} models, {sum(1 for v in used.values() if v)} textures, {len(miss)} missing')


if __name__ == '__main__':
    main()
