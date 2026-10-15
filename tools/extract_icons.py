#!/usr/bin/env python3
"""Copy the real item textures for this site out of your own Minecraft and mod jars.

The site works without them (it draws stand-in pixel icons). With them, the item slots show
the real textures. They are written to public/icons/<namespace>/<path>.png plus a manifest.json,
and both are ignored by git, so the textures are never published from this repo.

Usage (run from the repo root):
  python3 tools/extract_icons.py --mods "<instance>/mods" --minecraft "<.minecraft>/versions/1.20.1/1.20.1.jar"
Optional:
  --extra <folder>   loose asset folders, e.g. the pack's kubejs/assets (repeatable)
  --out public/icons

Then run `npm run dev` (or `npm run build` + `npm run preview`) to see them locally.
"""
import argparse, json, os, re, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def wanted():
    """namespace/path for every item in src/data/items.ts (tex override or the item id)."""
    src = open(os.path.join(ROOT, 'src', 'data', 'items.ts'), encoding='utf-8').read()
    out = []
    for m in re.finditer(r"add\('([^']+)'.*?\)\s*$", src, re.M):
        line = m.group(0)
        iid = m.group(1)
        t = re.search(r"tex: '([^']+)'", line)
        if t:
            out.append(t.group(1))
        elif not iid.startswith('fluid:'):
            out.append(iid.replace(':', '/'))
    return sorted(set(out))


def candidates(key):
    ns, path = key.split('/', 1)
    base = f'assets/{ns}/textures/'
    names = [f'item/{path}', f'block/{path}', f'block/{path}_side', f'block/{path}_top', f'block/{path}/side', f'block/{path}_front']
    return [base + n + '.png' for n in names]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--mods', help='folder with the mod .jar files')
    ap.add_argument('--minecraft', help='the vanilla client jar, e.g. versions/1.20.1/1.20.1.jar')
    ap.add_argument('--extra', action='append', default=[], help='loose asset folder (contains <namespace>/textures/...)')
    ap.add_argument('--out', default=os.path.join(ROOT, 'public', 'icons'))
    a = ap.parse_args()

    sources = []  # (kind, handle)
    jars = []
    if a.minecraft:
        jars.append(a.minecraft)
    if a.mods:
        jars += [os.path.join(a.mods, f) for f in sorted(os.listdir(a.mods)) if f.endswith('.jar')]
    for j in jars:
        try:
            z = zipfile.ZipFile(j)
            sources.append(('zip', z, set(z.namelist())))
        except Exception as e:
            print(f'skip {j}: {e}', file=sys.stderr)
    for d in a.extra:
        sources.append(('dir', d, None))
    if not sources:
        ap.error('give --mods and/or --minecraft (and optionally --extra)')

    found = []
    for key in wanted():
        hit = None
        for cand in candidates(key):
            for kind, h, names in sources:
                if kind == 'zip' and cand in names:
                    hit = h.read(cand); break
                if kind == 'dir':
                    p = os.path.join(h, cand[len('assets/'):])
                    if os.path.isfile(p):
                        hit = open(p, 'rb').read(); break
            if hit:
                break
        if hit:
            dst = os.path.join(a.out, key + '.png')
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            open(dst, 'wb').write(hit)
            found.append(key)
    json.dump(found, open(os.path.join(a.out, 'manifest.json'), 'w'), indent=0)
    total = len(wanted())
    print(f'{len(found)} of {total} icons copied to {a.out}. The rest keep their stand-in icons.')
    print('Note: animated textures (taller than wide) show their first frame.')


if __name__ == '__main__':
    main()
