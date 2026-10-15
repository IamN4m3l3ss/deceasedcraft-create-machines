# DeceasedCraft Create Machines

A small website with compact, resource-efficient Create builds for the DeceasedCraft modpack (Beta DH 5.10.17, Forge 1.20.1, Create 6.0.6):

- **Ammo & gun parts** – ammo line, parts ring and Metalworks, with 3D layouts and layer-by-layer grids
- **Rotational power** – early, mid and late game SU: windmills, coal boilers, max boiler, 20-engine diesel plant
- **Electricity** – early, mid and late game FE: thermoelectric rows, alternator banks, reactors and storage

Live site: https://iamn4m3l3ss.github.io/deceasedcraft-create-machines/

## How the site works

It's plain HTML, CSS and JavaScript, with no build step needed to host it. GitHub Pages serves the files in this repo as they are.

| Path | What it is |
| --- | --- |
| `index.html`, `ammo.html`, `kinetic.html`, `electricity.html` | The four pages |
| `assets/site.css` | All styling (light and dark theme) |
| `assets/viewer.js` | The 3D models, the layer grids and the tabs |
| `assets/vendor/` | three.js r128 (MIT licence) |
| `tools/` | Optional: the page sources and a script that rebuilds the four HTML files |

## Editing

You can edit the HTML files directly. If you'd rather keep the shared header and footer in one place, edit the files in `tools/src/` and run:

```
python3 tools/build.py .
```

## Turning on GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → Save. The site appears at the address above about a minute later.
