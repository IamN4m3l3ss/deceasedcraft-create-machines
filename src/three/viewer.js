// 3D build viewer. Blocks are drawn with small procedural stand-in textures, not the mods' textures.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const PI = Math.PI

/* ---------------- textures & materials ---------------- */
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
const TEX = {}, MAT = {}, GEO = {}
function px(g, x, y, c) { g.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; g.fillRect(x, y, 1, 1) }
function noise(g, r, base, v) { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const k = (r() - 0.5) * 2 * v; px(g, x, y, [base[0] + k | 0, base[1] + k | 0, base[2] + k | 0]) } }
function border(g, c) { for (let i = 0; i < 16; i++) { px(g, i, 0, c); px(g, i, 15, c); px(g, 0, i, c); px(g, 15, i, c) } }
function frame(g, c, inset) { for (let i = inset; i < 16 - inset; i++) { px(g, i, inset, c); px(g, i, 15 - inset, c); px(g, inset, i, c); px(g, 15 - inset, i, c) } }
function mkTex(key, seed, draw, repeat) {
  if (TEX[key]) return TEX[key]
  const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d')
  draw(g, rng(seed))
  const t = new THREE.CanvasTexture(c)
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping }
  TEX[key] = t; return t
}
const T = {
  casing: () => mkTex('casing', 11, (g, r) => { noise(g, r, [132, 136, 134], 12); border(g, [78, 82, 82]); for (let i = 1; i < 15; i++) px(g, i, 1, [158, 162, 160]); [[2, 2], [13, 2], [2, 13], [13, 13]].forEach((p) => px(g, p[0], p[1], [190, 192, 190])) }),
  gear: () => mkTex('gear', 12, (g, r) => { noise(g, r, [132, 136, 134], 12); border(g, [78, 82, 82]); for (let a = 0; a < 32; a++) { const t = a / 32 * PI * 2, rr = (a % 4 < 2) ? 5.2 : 4.2; px(g, Math.round(7.5 + Math.cos(t) * rr), Math.round(7.5 + Math.sin(t) * rr), [176, 128, 52]) } [[7, 7], [8, 8], [7, 8], [8, 7]].forEach((p) => px(g, p[0], p[1], [60, 60, 60])) }),
  brass: () => mkTex('brass', 13, (g, r) => { noise(g, r, [204, 158, 62], 16); border(g, [140, 98, 30]); for (let i = 2; i < 14; i++) px(g, i, 2, [236, 196, 110]) }),
  wood: () => mkTex('wood', 14, (g, r) => { noise(g, r, [152, 110, 64], 10); for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x++) px(g, x, y, [104, 72, 40]); border(g, [92, 62, 34]) }),
  chestf: () => mkTex('chestf', 15, (g, r) => { noise(g, r, [152, 110, 64], 10); for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x++) px(g, x, y, [104, 72, 40]); border(g, [92, 62, 34]); for (let y2 = 5; y2 < 9; y2++) for (let x2 = 7; x2 < 9; x2++) px(g, x2, y2, [200, 204, 206]) }),
  iron: () => mkTex('iron', 16, (g, r) => { noise(g, r, [190, 196, 200], 9); border(g, [118, 124, 128]) }),
  dark: () => mkTex('dark', 17, (g, r) => { noise(g, r, [80, 84, 88], 8); border(g, [52, 56, 58]) }),
  beltside: () => mkTex('beltside', 18, (g, r) => { noise(g, r, [44, 48, 52], 6) }),
  belttop: () => mkTex('belttop', 19, (g, r) => { noise(g, r, [54, 59, 64], 6); for (let y = 0; y < 16; y++) { px(g, 0, y, [34, 37, 40]); px(g, 15, y, [34, 37, 40]) } for (let k = 0; k < 6; k++) { const c = [132, 140, 146]; px(g, 7 - k, 4 + k, c); px(g, 8 + k, 4 + k, c); px(g, 7 - k, 5 + k, c); px(g, 8 + k, 5 + k, c) } }, true),
  shaft: () => mkTex('shaft', 20, (g, r) => { noise(g, r, [164, 168, 170], 8); for (let x = 0; x < 16; x += 4) for (let y = 0; y < 16; y++) px(g, x, y, [120, 124, 126]) }),
  green: () => mkTex('green', 21, (g, r) => { noise(g, r, [78, 156, 92], 10) }),
  blade: () => mkTex('blade', 22, (g, r) => { noise(g, r, [212, 216, 220], 6); border(g, [90, 94, 98]) }),
  copper: () => mkTex('copper', 23, (g, r) => { noise(g, r, [186, 108, 64], 10); border(g, [118, 64, 36]); for (let i = 2; i < 14; i++) px(g, i, 2, [226, 156, 104]); for (let y = 5; y < 11; y++) for (let x = 5; x < 11; x++) if (x === 5 || x === 10 || y === 5 || y === 10) px(g, x, y, [140, 80, 46]) }),
  stone: () => mkTex('stone', 24, (g, r) => { noise(g, r, [124, 124, 122], 14) }),
  cloth: () => mkTex('cloth', 25, (g, r) => { noise(g, r, [236, 234, 226], 6); for (let i = 0; i < 16; i += 3) for (let j = 0; j < 16; j++) px(g, i, j, [214, 212, 204]); border(g, [150, 120, 80]) }),
  log: () => mkTex('log', 26, (g, r) => { noise(g, r, [104, 78, 48], 10); for (let x = 1; x < 16; x += 3) for (let y = 0; y < 16; y++) if (r() > 0.4) px(g, x, y, [74, 54, 32]) }),
  burnLit: () => mkTex('burnlit', 27, (g, r) => { noise(g, r, [236, 128, 36], 22); for (let x = 0; x < 16; x += 3) for (let y = 0; y < 16; y++) px(g, x, y, [48, 42, 40]); border(g, [40, 36, 34]) }),
  burnCake: () => mkTex('burncake', 28, (g, r) => { noise(g, r, [92, 196, 236], 20); for (let x = 0; x < 16; x += 3) for (let y = 0; y < 16; y++) px(g, x, y, [36, 44, 52]); border(g, [30, 36, 42]) }),
  reactor: () => mkTex('reactor', 29, (g, r) => { noise(g, r, [96, 102, 110], 7); border(g, [54, 58, 64]); frame(g, [128, 134, 142], 2); for (let i = 4; i < 12; i++) { px(g, i, 4, [70, 74, 82]); px(g, i, 11, [70, 74, 82]) } }),
  reactorFace: () => mkTex('reactorface', 30, (g, r) => { noise(g, r, [96, 102, 110], 7); border(g, [54, 58, 64]); for (let y = 4; y < 12; y++) for (let x = 4; x < 12; x++) px(g, x, y, [40, 44, 52]); for (let x = 5; x < 11; x++) px(g, x, 7, [98, 210, 120]) }),
  fuel: () => mkTex('fuel', 31, (g, r) => { noise(g, r, [92, 190, 84], 18); for (let x = 0; x < 16; x += 5) for (let y = 0; y < 16; y++) px(g, x, y, [60, 70, 66]) }),
  ctrl: () => mkTex('ctrl', 32, (g, r) => { noise(g, r, [60, 64, 70], 6); border(g, [30, 32, 36]); for (let y = 5; y < 11; y++) for (let x = 5; x < 11; x++) px(g, x, y, [210, 190, 70]) }),
  thermo: () => mkTex('thermo', 33, (g, r) => { noise(g, r, [180, 122, 84], 10); border(g, [96, 104, 112]); frame(g, [96, 104, 112], 4); for (let y = 6; y < 10; y++) for (let x = 6; x < 10; x++) px(g, x, y, [210, 160, 110]) }),
  alt: () => mkTex('alt', 34, (g, r) => { noise(g, r, [186, 108, 64], 10); for (let y = 0; y < 16; y += 3) for (let x = 0; x < 16; x++) px(g, x, y, [126, 70, 40]) }),
  girder: () => mkTex('girder', 35, (g, r) => { noise(g, r, [78, 82, 90], 6); border(g, [44, 46, 50]); for (let i = 0; i < 16; i++) { px(g, i, i, [110, 116, 124]); px(g, 15 - i, i, [110, 116, 124]) } }),
  zinc: () => mkTex('zinc', 36, (g, r) => { noise(g, r, [168, 196, 186], 8); border(g, [110, 132, 124]) }),
  scaff: () => mkTex('scaff', 37, (g, r) => { noise(g, r, [150, 156, 152], 8); frame(g, [96, 100, 98], 0); frame(g, [96, 100, 98], 1); for (let i = 2; i < 14; i++) px(g, i, i, [110, 114, 112]) }),
  distill: () => mkTex('distill', 38, (g, r) => { noise(g, r, [176, 110, 70], 8); border(g, [96, 56, 34]); for (let y = 3; y < 13; y++) { px(g, 4, y, [70, 70, 74]); px(g, 11, y, [70, 70, 74]) } for (let x = 4; x < 12; x++) px(g, x, 8, [70, 70, 74]) }),
  dieselEng: () => mkTex('dieseleng', 39, (g, r) => { noise(g, r, [70, 74, 80], 6); border(g, [36, 38, 42]); for (let x = 3; x < 13; x += 3) for (let y = 3; y < 13; y++) px(g, x, y, [120, 124, 130]) }),
  ground: () => mkTex('ground', 40, (g, r) => { noise(g, r, [92, 98, 84], 10) }),
}
function mat(key, opts) {
  if (MAT[key]) return MAT[key]
  const o = Object.assign({}, opts || {}); if (!o.map && !o.color && T[key]) o.map = T[key]()
  return (MAT[key] = new THREE.MeshLambertMaterial(o))
}
function colorMat(key, color, extra) { return MAT[key] || (MAT[key] = new THREE.MeshLambertMaterial(Object.assign({ color }, extra || {}))) }
const waterMat = () => colorMat('water', 0x3f86d8, { transparent: true, opacity: 0.45, depthWrite: false })
const lavaMat = () => colorMat('lava', 0xff7a1a, { emissive: 0x7a2a00 })
const glassMat = () => colorMat('glass', 0xcfe6ee, { transparent: true, opacity: 0.2, depthWrite: false })
const oilMat = () => colorMat('oil', 0x2a2622)
function box(w, h, d) { const k = 'b' + w + '_' + h + '_' + d; return GEO[k] || (GEO[k] = new THREE.BoxGeometry(w, h, d)) }
function cyl(r, h, s) { const k = 'c' + r + '_' + h + '_' + (s || 12); return GEO[k] || (GEO[k] = new THREE.CylinderGeometry(r, r, h, s || 12)) }
function mesh(geo, m, x, y, z) { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); return o }
function label(text, bg, fg) {
  const w = Math.max(128, Math.ceil((text.length * 18 + 36) / 32) * 32)
  const c = document.createElement('canvas'); c.width = w; c.height = 64; const g = c.getContext('2d')
  g.fillStyle = bg; g.beginPath(); if (g.roundRect) g.roundRect(4, 8, w - 8, 48, 12); else g.rect(4, 8, w - 8, 48); g.fill()
  g.fillStyle = fg; g.font = '600 28px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 33)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  // constant on-screen size, so labels stay readable on big builds
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }))
  s.scale.set(0.064 * w / 128, 0.032, 1); s.renderOrder = 10; return s
}
const LBL = { amber: ['#E3A93B', '#1B1406'], green: ['#3E9A5A', '#F2FBF3'], blue: ['#3B78C4', '#EEF4FB'], slate: ['#5B6774', '#F3F6F8'], oil: ['#3B362C', '#F2EED8'], red: ['#B9473C', '#FFF1EE'] }
function shaftMesh(axis, len) { const m = mesh(cyl(0.14, len || 1), mat('shaft')); if (axis === 'x') m.rotation.z = PI / 2; if (axis === 'z') m.rotation.x = PI / 2; return m }

function baseScene() {
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5258, 2.3))
  const sun = new THREE.DirectionalLight(0xffffff, 1.9); sun.position.set(6, 12, 8); scene.add(sun)
  const back = new THREE.DirectionalLight(0xb8c8ff, 0.5); back.position.set(-8, 5, -6); scene.add(back)
  return scene
}
function addGround(scene, minX, maxX, minZ, maxZ) {
  const gw = Math.max(maxX - minX, maxZ - minZ) + 6
  const grid = new THREE.GridHelper(gw, gw, 0x8a96a3, 0x8a96a3)
  grid.material.transparent = true; grid.material.opacity = 0.18
  grid.position.set(Math.round((minX + maxX) / 2) + (gw % 2 ? 0 : 0.5), -0.5, Math.round((minZ + maxZ) / 2) + (gw % 2 ? 0 : 0.5))
  scene.add(grid)
}
function put(scene, obj, x, y, z) { obj.position.set(x, y, z); scene.add(obj); return obj }
function block(m) { return new THREE.Mesh(box(1, 1, 1), m) }
function tag(scene, text, x, y, z, tone) { const [bg, fg] = LBL[tone || 'amber']; return put(scene, label(text, bg, fg), x, y, z) }

/* ---------------- token-grid builds ---------------- */
function neighborChest(L, zi, xi) {
  const rows = L.rows.map((r) => r.split(' '))
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (const d of dirs) { const nz = zi + d[1], nx = xi + d[0]; if (rows[nz] && rows[nz][nx] && rows[nz][nx][0] === 'C' && rows[nz][nx].length === 2 && 'io'.includes(rows[nz][nx][1])) return d }
  return null
}
function chestMesh() { const w = mat('wood'), fr = mat('chestf'); const c = new THREE.Mesh(box(0.875, 0.875, 0.875), [w, w, w, w, fr, fr]); c.position.y = -0.0625; return c }
function powerIn() {
  const g = new THREE.Group()
  g.add(mesh(cyl(0.14, 1), mat('green')))
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 12), mat('green')); cone.rotation.x = PI; cone.position.y = 0.85; g.add(cone)
  const pl = label('POWER', ...LBL.green); pl.position.set(0, 1.45, 0); g.add(pl)
  return g
}
function cogMesh(sign, anim, axis) {
  const cog = new THREE.Group(), wm = mat('wood')
  const disc = mesh(cyl(0.36, 0.22, 16), wm); disc.rotation.x = PI / 2; cog.add(disc)
  for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; const tth = mesh(box(0.16, 0.16, 0.2), wm, Math.cos(a) * 0.43, Math.sin(a) * 0.43, 0); tth.rotation.z = a; cog.add(tth) }
  const ax = mesh(cyl(0.12, 1), mat('shaft')); ax.rotation.x = PI / 2; cog.add(ax)
  anim.push((t, dt) => { cog.rotation.z += dt * 2.2 * sign })
  if (axis === 'x') { const g = new THREE.Group(); g.rotation.y = PI / 2; g.add(cog); return g }
  return cog
}
function largeCog(anim, sign, axis) {
  const cog = new THREE.Group(), wm = mat('wood')
  const disc = mesh(cyl(0.95, 0.22, 24), wm); disc.rotation.x = PI / 2; cog.add(disc)
  for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2; const tth = mesh(box(0.18, 0.18, 0.2), wm, Math.cos(a) * 1.02, Math.sin(a) * 1.02, 0); tth.rotation.z = a; cog.add(tth) }
  const ax = mesh(cyl(0.12, 1), mat('shaft')); ax.rotation.x = PI / 2; cog.add(ax)
  anim.push((t, dt) => { cog.rotation.z += dt * 1.1 * (sign || 1) })
  if (axis === 'x') { const g = new THREE.Group(); g.rotation.y = PI / 2; g.add(cog); return g }
  return cog
}
function itemMesh(kind) {
  const colors = { casing: '#D4A640', box: '#B08A58', plate: '#B8BEC2' }
  return new THREE.Mesh(box(0.32, 0.18, 0.32), new THREE.MeshLambertMaterial({ color: colors[kind] || '#ccc' }))
}
function tokenBlock(tok, L, zi, xi, anim) {
  const grp = new THREE.Group()
  if (tok === '.' || tok === '~') return null
  if (tok[0] === 'B' && tok.length >= 2 && '<>^v'.includes(tok[1])) {
    const d = tok[1], f = tok.slice(2)
    grp.add(mesh(box(1, 0.36, 1), mat('beltside'), 0, -0.32, 0))
    const top = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98), mat('belttop'))
    top.rotation.x = -PI / 2; top.position.y = -0.135
    const holder = new THREE.Group(); holder.add(top)
    holder.rotation.y = ({ '^': 0, '<': PI / 2, '>': -PI / 2, 'v': PI })[d]
    grp.add(holder)
    const alongX = (d === '<' || d === '>')
    if (f.includes('*')) { const p = mesh(cyl(0.18, 1.08), mat('shaft'), 0, -0.32, 0); if (alongX) p.rotation.x = PI / 2; else p.rotation.z = PI / 2; grp.add(p) }
    if (/[iob]/.test(f)) {
      const nb = neighborChest(L, zi, xi)
      if (nb) grp.add(mesh(nb[0] ? box(0.22, 0.5, 0.86) : box(0.86, 0.5, 0.22), f.includes('b') ? mat('brass') : mat('iron'), nb[0] * 0.4, 0.02, nb[1] * 0.4))
    }
    return grp
  }
  switch (tok) {
    case 'Ci': case 'Co': { grp.add(chestMesh()); const lb = label(tok === 'Ci' ? 'IN' : 'OUT', '#8C6640', '#FFF4E6'); lb.position.set(0, 0.75, 0); grp.add(lb); return grp }
    case 'G': grp.add(mesh(box(1, 1, 1), mat('gear'))); return grp
    case 'S-': grp.add(shaftMesh('x')); return grp
    case 'S|': grp.add(shaftMesh('z')); return grp
    case 'So': grp.add(shaftMesh('y')); return grp
    case 'Pw': grp.add(powerIn()); return grp
    case 'H':
      grp.add(mesh(box(1, 0.42, 1), mat('dark'), 0, 0.29, 0)); grp.add(mesh(box(0.5, 0.4, 0.5), mat('dark'), 0, -0.12, 0)); grp.add(mesh(box(0.26, 0.3, 0.26), mat('dark'), 0, -0.45, 0)); return grp
    case 'P': {
      grp.add(mesh(box(1, 0.72, 1), mat('casing'), 0, 0.14, 0)); grp.add(mesh(box(0.82, 0.3, 0.82), mat('iron'), 0, -0.4, 0))
      const head = mesh(box(0.82, 0.18, 0.82), mat('iron'), 0, -0.68, 0); grp.add(head)
      anim.push((t) => { head.position.y = -0.68 - Math.max(0, Math.sin(t * 3 + xi)) * 0.25 }); return grp
    }
    case 'X': {
      grp.add(mesh(box(1, 0.62, 1), mat('casing'), 0, -0.19, 0))
      const blade = mesh(cyl(0.44, 0.07, 16), mat('blade'), 0, 0.2, 0); blade.rotation.x = PI / 2; grp.add(blade)
      anim.push((t, dt) => { blade.rotation.y -= dt * 6 })
      const sl = label('SAW', ...LBL.slate); sl.position.set(0, 0.9, -0.2); grp.add(sl); return grp
    }
    case 'c': grp.add(cogMesh(xi % 2 ? 1 : -1, anim)); return grp
    // thermoelectric row
    case 'Tg': grp.add(mesh(box(1, 1, 1), mat('thermo'))); return grp
    case 'Lv': grp.add(block(lavaMat())); return grp
    case 'Wa': grp.add(block(waterMat())); return grp
    case 'St': grp.add(block(mat('stone'))); return grp
    case 'Gl': grp.add(block(glassMat())); return grp
    case 'Cn': grp.add(mesh(box(0.34, 0.34, 0.5), colorMat('terra', 0xa5624a), 0, 0, 0.25)); grp.add(mesh(cyl(0.08, 0.3), mat('copper'), 0, 0.3, 0.25)); return grp
    // reactor
    case 'Rc': grp.add(block(mat('reactor'))); return grp
    case 'Rk': { grp.add(block(mat('reactorFace'))); const l = label('CONTROLLER', ...LBL.slate); l.position.set(0, 0.9, 0.9); grp.add(l); return grp }
    case 'Rt': { grp.add(block(mat('reactor'))); grp.add(mesh(box(0.5, 0.5, 0.1), colorMat('tap', 0xc0392b), 0.51, 0, 0)); const l = label('POWER', ...LBL.red); l.position.set(1.2, 0.8, 0); grp.add(l); return grp }
    case 'Ra': { grp.add(block(mat('reactor'))); grp.add(mesh(box(0.1, 0.5, 0.5), mat('brass'), -0.51, 0, 0)); return grp }
    case 'Rf': { const m = mesh(cyl(0.38, 1, 12), mat('fuel', { emissive: 0x1d4a14 })); grp.add(m); grp.add(mesh(box(0.9, 1, 0.9), glassMat())); return grp }
    case 'Rr': { grp.add(block(mat('ctrl'))); return grp }
  }
  if (/^[DS]\d$/.test(tok)) {
    grp.add(mesh(box(1, 1, 1), mat('casing')))
    grp.add(mesh(box(1.02, 0.22, 1.02), mat('brass'), 0, -0.3, 0))
    grp.add(mesh(cyl(0.11, 0.55), mat('shaft'), 0, -0.72, 0))
    grp.add(mesh(box(0.38, 0.14, 0.38), mat('brass'), 0, -1.02, 0))
    const dl = label(tok, ...LBL.amber); dl.position.set(0, 0.1, -0.85); grp.add(dl)
    return grp
  }
  return null
}
function buildTokenScene(G) {
  const scene = baseScene(), anim = [], layerGroups = []
  let minX = 99, maxX = -99, minZ = 99, maxZ = -99, maxY = 0
  G.layers.forEach((L) => {
    const lg = new THREE.Group(); lg.userData.y = L.y
    L.rows.forEach((row, zi) => {
      row.split(' ').forEach((tok, xi) => {
        const blk = tokenBlock(tok, L, zi, xi, anim)
        if (!blk) return
        const z = G.zs[zi]
        blk.position.set(xi, L.y, z); lg.add(blk)
        minX = Math.min(minX, xi); maxX = Math.max(maxX, xi); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); maxY = Math.max(maxY, L.y)
      })
    })
    scene.add(lg); layerGroups.push(lg)
  })
  addGround(scene, minX, maxX, minZ, maxZ)
  if (G.path) {
    const pts = G.path.map((p) => new THREE.Vector3(p[0], -0.02, p[1]))
    const segs = []; let total = 0
    for (let i = 0; i < pts.length - 1; i++) { const len = pts[i].distanceTo(pts[i + 1]); segs.push({ a: pts[i], b: pts[i + 1], len, start: total }); total += len }
    const n = G.loop ? 5 : 3, items = []
    for (let j = 0; j < n; j++) { const it = itemMesh(G.item); scene.add(it); items.push(it) }
    const speed = 1.4
    const place = (t) => {
      items.forEach((it, k) => {
        const s = ((t * speed + k * total / n) % total + total) % total
        for (const sg of segs) { if (s <= sg.start + sg.len) { it.position.copy(sg.a).lerp(sg.b, (s - sg.start) / sg.len); break } }
        if (!G.loop) { const fade = s / total; it.visible = fade > 0.02 && fade < 0.98 }
      })
    }
    anim.push((t) => { place(t); if (TEX.belttop) TEX.belttop.offset.y = -((t * speed) % 1) })
    place(0)
  }
  if (MAT.lava) anim.push((t) => { MAT.lava.emissiveIntensity = 0.8 + Math.sin(t * 2) * 0.2 })
  return { scene, anim, layers: layerGroups, center: new THREE.Vector3((minX + maxX) / 2, maxY / 2, (minZ + maxZ) / 2), span: Math.max(maxX - minX + 1, (maxZ - minZ + 1) * 1.4, (maxY + 1) * 2) }
}

/* ---------------- power builds ---------------- */
function water(scene, x, y, z) { put(scene, new THREE.Mesh(box(1, 1, 1), waterMat()), x, y, z) }
function largeWheel(anim) {
  const g = new THREE.Group(), spin = new THREE.Group(), wm = mat('wood')
  const hub = mesh(cyl(1.0, 0.7, 20), wm); hub.rotation.z = PI / 2; spin.add(hub)
  for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; const pd = mesh(box(0.85, 0.12, 0.62), wm, 0, Math.cos(a) * 1.18, Math.sin(a) * 1.18); pd.rotation.x = a - PI / 2; spin.add(pd) }
  spin.add(shaftMesh('x', 1.0))
  g.add(spin)
  anim.push((t, dt) => { spin.rotation.x -= dt * 0.9 })
  return g
}
function burner(cake) {
  const g = new THREE.Group()
  const m = cake ? mat('burnCake', { map: T.burnCake(), emissive: 0x0d3a4a }) : mat('burnLit', { map: T.burnLit(), emissive: 0x4a2205 })
  g.add(mesh(box(0.92, 0.92, 0.92), m, 0, -0.04, 0))
  return g
}
function engine(dirZ, anim, phase) {
  const g = new THREE.Group()
  g.add(mesh(box(0.8, 0.8, 0.55), mat('copper'), 0, 0, -dirZ * 0.2))
  g.add(mesh(box(0.86, 0.2, 0.6), mat('brass'), 0, 0.32, -dirZ * 0.2))
  const rod = mesh(cyl(0.08, 1.5), mat('iron')); rod.rotation.x = PI / 2; rod.position.set(0, 0, dirZ * 0.85); g.add(rod)
  anim.push((t) => { rod.position.y = Math.sin(t * 6 + phase) * 0.15 })
  return g
}
function pump() { const g = new THREE.Group(); g.add(mesh(box(0.7, 0.7, 0.7), mat('copper'))); const c = mesh(cyl(0.42, 0.16, 12), mat('wood')); c.rotation.z = PI / 2; g.add(c); return g }
function pipe(axis, len) { const m = mesh(cyl(0.2, len || 1), mat('copper')); if (axis === 'x') m.rotation.z = PI / 2; if (axis === 'z') m.rotation.x = PI / 2; return m }
function arm() { const g = new THREE.Group(); g.add(mesh(box(0.9, 0.5, 0.9), mat('brass'), 0, -0.25, 0)); const a1 = mesh(box(0.18, 1.1, 0.18), mat('brass'), 0, 0.4, 0); a1.rotation.z = 0.5; g.add(a1); const a2 = mesh(box(0.18, 0.9, 0.18), mat('brass'), -0.55, 0.85, 0); a2.rotation.z = -1.1; g.add(a2); return g }
function alternator() {
  const g = new THREE.Group()
  const body = mesh(cyl(0.42, 0.9, 16), mat('alt')); body.rotation.x = PI / 2; g.add(body)
  g.add(mesh(box(0.9, 0.18, 0.9), mat('iron'), 0, -0.4, 0))
  g.add(mesh(cyl(0.07, 0.3), mat('copper'), 0, 0.55, 0))
  return g
}
function hugeEngine(dirZ, anim, phase) {
  // engine 2 blocks from its shaft; dirZ points from the engine toward the shaft
  const g = new THREE.Group()
  g.add(mesh(box(0.98, 0.98, 0.98), mat('dieselEng')))
  g.add(mesh(box(1.0, 0.18, 1.0), mat('brass'), 0, 0.42, 0))
  const ex = mesh(cyl(0.1, 0.5), mat('iron'), 0.3, 0.75, -dirZ * 0.2); g.add(ex)
  const rod = mesh(cyl(0.09, 1.6), mat('iron')); rod.rotation.x = PI / 2; rod.position.set(0, 0, dirZ * 1.0); g.add(rod)
  anim.push((t) => { rod.position.y = Math.sin(t * 9 + phase) * 0.18 })
  return g
}

function boilerScene(opts) {
  const scene = baseScene(), anim = [], W = opts.w, H = opts.h
  for (let x = 0; x < W; x++) for (let z = 0; z < W; z++) {
    put(scene, burner(opts.cake), x, 0, z)
    for (let y = 1; y <= H; y++) put(scene, block(mat('copper')), x, y, z)
  }
  let ph = 0
  opts.faces.forEach((fz) => {
    const ez = fz < 0 ? -1 : W, sz = fz < 0 ? -3 : W + 2
    opts.rows.forEach((y) => {
      for (let x = 0; x < W; x++) { put(scene, engine(fz, anim, ph += 0.9), x, y, ez); put(scene, shaftMesh('x'), x, y, sz) }
      put(scene, block(mat('gear')), W, y, sz)
    })
  })
  if (opts.faces.length > 1) for (let z2 = -2; z2 <= W + 1; z2++) put(scene, shaftMesh('z'), W, opts.rows[0], z2)
  const outY = opts.rows[0], outZ = opts.faces[0] < 0 ? -3 : W + 2
  for (let xo = W + 1; xo <= W + 2; xo++) put(scene, shaftMesh('x'), xo, outY, outZ)
  tag(scene, opts.out, W + 2.5, outY + 1.1, outZ, 'green')
  opts.pumps.forEach((pz) => {
    const py = 2
    put(scene, pipe('x'), -1, py, pz); put(scene, pipe('x'), -2, py, pz); put(scene, pump(), -3, py, pz); put(scene, pipe('x'), -4, py, pz)
    put(scene, pipe('y'), -5, py, pz); put(scene, pipe('y'), -5, py - 1, pz)
    for (let wx = -6; wx <= -5; wx++) for (let wz = pz; wz <= pz + 1; wz++) water(scene, wx, 0, wz)
    tag(scene, '2×2 POOL', -5.5, py + 1.3, pz + 0.5, 'blue')
  })
  const zmin = Math.min(...opts.pumps) - 1, zmax = Math.max(...opts.pumps) + 2
  put(scene, arm(), opts.arm[0], 0, opts.arm[1])
  put(scene, chestMesh(), opts.arm[0] + 1, 0, opts.arm[1])
  tag(scene, opts.cake ? 'ARM + CAKES' : 'ARM + COAL', opts.arm[0] + 0.5, 1.5, opts.arm[1] - 0.6, 'slate')
  tag(scene, 'LEVEL ' + opts.level, (W - 1) / 2, H + 1.2, (W - 1) / 2)
  anim.push((t) => { const k = 0.75 + Math.sin(t * 7) * 0.25;['burnLit', 'burnCake'].forEach((n) => { if (MAT[n]) MAT[n].emissiveIntensity = k }) })
  addGround(scene, -6, W + 2, Math.min(-3, zmin), Math.max(W + 2, zmax))
  return { scene, anim, layers: [], center: new THREE.Vector3(W / 2 - 1.5, H / 2, W / 2 - 0.5), span: W + 10 }
}

function bankScene(n, out) {
  const scene = baseScene(), anim = []
  // input from the boiler at 64 RPM, two large->small steps to 256 RPM, then a gearbox row with alternators north and south
  put(scene, shaftMesh('x'), -5, 1, 0)
  put(scene, largeCog(anim, 1, 'x'), -4, 1, 0)
  put(scene, cogMesh(-1, anim, 'x'), -4, 1, 1.35)
  put(scene, shaftMesh('x'), -3, 1, 1.35)
  put(scene, largeCog(anim, 1, 'x'), -2, 1, 1.35)
  put(scene, cogMesh(-1, anim, 'x'), -2, 1, 2.7)
  put(scene, shaftMesh('x'), -1, 1, 2.7)
  tag(scene, '64 → 256 RPM', -2.5, 3.2, 1.35, 'slate')
  tag(scene, 'FROM BOILER', -5.5, 1.9, -0.6, 'slate')
  for (let x = 0; x < n; x++) {
    put(scene, block(mat('gear')), x, 1, 2.7)
    put(scene, alternator(), x, 1, 1.7)
    put(scene, alternator(), x, 1, 3.7)
  }
  tag(scene, (2 * n) + ' × 180 = ' + (2 * n * 180).toLocaleString('en-US') + ' FE/t', (n - 1) / 2, 2.8, 2.7)
  tag(scene, out, (n - 1) / 2, 2.2, 4.6, 'green')
  addGround(scene, -6, n, -1, 5)
  return { scene, anim, layers: [], center: new THREE.Vector3((n - 6) / 2, 1, 2.2), span: n + 6 }
}

function dieselScene() {
  const scene = baseScene(), anim = []
  let ph = 0
  // ---- engine row: 10-long shaft at z0, 10 engines on each side 2 blocks out (as in the mod's ponder)
  const shaftGroup = new THREE.Group(); scene.add(shaftGroup)
  for (let x = 0; x < 10; x++) {
    put(scene, shaftMesh('x'), x, 1, 0)
    put(scene, hugeEngine(1, anim, ph += 0.7), x, 1, -2)
    put(scene, hugeEngine(-1, anim, ph += 0.7), x, 1, 2)
    put(scene, pipe('x'), x, 2, -2); put(scene, pipe('x'), x, 2, 2)
  }
  put(scene, largeCog(anim, 1, 'x'), 10, 1, 0)
  put(scene, shaftMesh('x'), 11, 1, 0)
  tag(scene, '327,680 SU', 11.5, 2.6, 0, 'green')
  tag(scene, '20 HUGE ENGINES · 16,384 SU EACH', 4.5, 3.6, 0)
  // diesel manifold + tank
  for (let z = -2; z <= 2; z++) put(scene, pipe('z'), -1, 2, z)
  put(scene, pump(), -2, 2, 0)
  for (let y = 0; y < 4; y++) put(scene, block(mat('copper')), -3, y, 0)
  tag(scene, 'DIESEL 20 mB/s', -3, 5.0, 0, 'oil')
  // ---- distillation: two 1x1x3 towers on heated burners
  const TX = -7
  ;[-1, 1].forEach((tz) => {
    put(scene, burner(false), TX, 0, tz)
    for (let y = 1; y <= 3; y++) put(scene, block(mat('distill')), TX, y, tz)
  })
  for (let x = TX + 1; x <= -4; x++) put(scene, pipe('x'), x, 2, 0)
  tag(scene, '2 DISTILLATION TOWERS', TX, 5.4, 0, 'slate')
  // gasoline storage
  for (let y = 0; y < 3; y++) put(scene, block(mat('copper')), TX, y, 3)
  put(scene, pipe('z'), TX, 3, 2)
  tag(scene, 'GASOLINE', TX, 3.6, 3.4, 'oil')
  // crude buffer
  for (let y = 0; y < 2; y++) put(scene, block(mat('copper')), TX - 2, y, -3)
  tag(scene, 'CRUDE OIL', TX - 2, 2.6, -3.4, 'oil')
  for (let x = TX - 1; x <= TX - 1; x++) put(scene, pipe('x'), x, 1, -3)
  put(scene, pipe('z'), TX, 1, -2)
  // ---- pumpjack (layout from the CDG ponder scene), arm along x
  const HX = -20 // hole x
  put(scene, block(mat('copper')), HX, 0, 0) // pumpjack hole (copper casing)
  for (let d = 1; d <= 9; d++) { const p = put(scene, pipe('y'), HX, -d, 0); p.material = mat('copper') }
  put(scene, block(oilMat()), HX, -10, 0)
  tag(scene, 'PIPES TO BEDROCK', HX - 1.5, -5, 0, 'oil')
  // pipes from hole to pump and on to the towers
  put(scene, pipe('x'), HX + 1, 0, 1); put(scene, pipe('z'), HX, 0, 1)
  put(scene, pump(), HX + 2, 0, 1)
  for (let x = HX + 3; x <= TX - 3; x++) put(scene, pipe('x'), x, 0, 1)
  for (let z = -2; z <= 1; z++) put(scene, pipe('z'), TX - 2, 0, z)
  // scaffold tower at the pivot (x = HX+4), 3 tall, on both sides of the arm
  const PX = HX + 4
  for (let y = 0; y < 3; y++) { put(scene, block(mat('scaff')), PX, y, -1); put(scene, block(mat('scaff')), PX, y, 1) }
  put(scene, block(mat('casing')), PX, 3, -1) // pumpjack bearing
  tag(scene, 'PUMPJACK', PX, 6.4, 0, 'slate')
  // the rocking arm: head over the hole, iron block, girders, iron block (pivot), zinc block, girders, bearing B over the crank
  const armG = new THREE.Group(); armG.position.set(PX, 3, 0); scene.add(armG)
  const seg = (dx, m, w, h) => { armG.add(mesh(box(1, h || 1, w || 1), m, dx, 0, 0)) }
  seg(-4, mat('zinc')) // head
  armG.add(mesh(box(0.35, 1.6, 0.35), mat('dark'), -4, -1.2, 0)) // rod down to the hole
  seg(-3, mat('iron')); seg(-2, mat('girder'), 0.6, 0.6); seg(-1, mat('girder'), 0.6, 0.6); seg(0, mat('iron'))
  armG.add(mesh(box(1, 1, 1), mat('zinc'), 0, 0, 1))
  for (let dx = 1; dx <= 3; dx++) seg(dx, mat('girder'), 0.6, 0.6)
  seg(4, mat('casing'))
  anim.push((t) => { armG.rotation.z = Math.sin(t * 1.6) * 0.18 })
  // crank under the far end
  const CX = PX + 4
  put(scene, block(mat('casing')), CX, 0, 0)
  const crankArm = new THREE.Group(); crankArm.position.set(CX, 0.6, 0); scene.add(crankArm)
  crankArm.add(mesh(box(0.2, 0.9, 0.2), mat('iron'), 0, 0.35, 0.55))
  anim.push((t) => { crankArm.rotation.z = t * 1.6 })
  put(scene, largeCog(anim, 1), CX, 0, 1)
  // ground cut-away so the well pipe is visible
  const gnd = new THREE.Mesh(box(30, 0.05, 10), new THREE.MeshLambertMaterial({ color: 0x5e6a52, transparent: true, opacity: 0.25, depthWrite: false }))
  gnd.position.set(-5, -0.52, 0); scene.add(gnd)
  anim.push((t) => { const k = 0.75 + Math.sin(t * 7) * 0.25; if (MAT.burnLit) MAT.burnLit.emissiveIntensity = k })
  addGround(scene, HX - 1, 12, -4, 4)
  return { scene, anim, layers: [], center: new THREE.Vector3(-4, 1, 0), span: 30 }
}

const SCENES = {
  wheels() {
    const scene = baseScene(), anim = []
    ;[0, 2, 4].forEach((x) => {
      put(scene, largeWheel(anim), x, 1, 0)
      for (let z = -1; z <= 1; z++) water(scene, x, 3, z)
      for (let y = 2; y >= 0; y--) water(scene, x, y, 2)
      tag(scene, '512 SU', x, 4.3, 0)
    })
    ;[1, 3, 5].forEach((x) => put(scene, shaftMesh('x'), x, 1, 0))
    put(scene, block(mat('gear')), 6, 1, 0)
    put(scene, block(mat('stone')), 6, 0, 0)
    tag(scene, '1,536 SU @ 4 RPM', 6.5, 2.4, 0, 'green')
    addGround(scene, -1, 7, -2, 3)
    return { scene, anim, layers: [], center: new THREE.Vector3(3, 1.5, 0.5), span: 9 }
  },
  windmill() {
    const scene = baseScene(), anim = []
    const hy = 9
    for (let y = 0; y < hy; y++) put(scene, block(mat('stone')), 0, y, 0)
    put(scene, block(mat('casing')), 0, hy, 0)
    const plate = mesh(cyl(0.45, 0.12, 16), mat('wood'), 0, hy, -0.52); plate.rotation.x = PI / 2; scene.add(plate)
    put(scene, shaftMesh('z'), 0, hy, 1)
    put(scene, block(mat('gear')), 0, hy, 2)
    for (let y2 = hy - 1; y2 >= 1; y2--) put(scene, shaftMesh('y'), 0, y2, 2)
    put(scene, block(mat('gear')), 0, 0, 2)
    put(scene, shaftMesh('x'), 1, 0, 2); put(scene, shaftMesh('x'), 2, 0, 2)
    tag(scene, '4,096 SU @ 8 RPM', 2.6, 1.3, 2, 'green')
    const rotor = new THREE.Group(); rotor.position.set(0, hy, -1); scene.add(rotor)
    rotor.add(mesh(box(1, 1, 1), mat('log')))
    const all = []
    for (let dx = 0; dx <= 1; dx++) for (let dy = 1; dy <= 8; dy++) { let p = [dx, dy]; for (let r = 0; r < 4; r++) { all.push(p); p = [p[1], -p[0]] } }
    all.forEach((c) => rotor.add(mesh(box(0.98, 0.98, 0.14), mat('cloth'), c[0], c[1], 0)))
    anim.push((t, dt) => { rotor.rotation.z -= dt * 0.35 })
    tag(scene, '64 SAILS', 0, hy + 9.6, -1.2)
    addGround(scene, -9, 9, -3, 4)
    return { scene, anim, layers: [], center: new THREE.Vector3(0, hy - 1, 0), span: 20 }
  },
  boiler4: () => boilerScene({ w: 2, h: 4, cake: false, faces: [1], rows: [2, 3], level: 4, out: '65,536 SU @ 64 RPM', pumps: [0], arm: [2, -1] }),
  boiler18: () => boilerScene({ w: 3, h: 8, cake: true, faces: [-1, 1], rows: [2, 3, 4], level: 18, out: '294,912 SU @ 64 RPM', pumps: [0, 2], arm: [-1, -1] }),
  diesel: dieselScene,
  altbank: () => bankScene(4, 'USES 65,536 SU'),
  bigbank: () => bankScene(18, 'USES 294,912 SU'),
}

/* ---------------- viewer ---------------- */
export function createViewer(host) {
  const V = { scenes: {}, current: null, visible: true, last: performance.now(), clock: 0, dead: false }
  let renderer
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) } catch (e) { V.dead = true; return V }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  host.insertBefore(renderer.domElement, host.firstChild)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true; controls.dampingFactor = 0.12
  controls.maxPolarAngle = PI * 0.495; controls.minDistance = 3; controls.maxDistance = 90
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); renderOnce() }
  const ro = new ResizeObserver(resize); ro.observe(host)
  let io = null
  if ('IntersectionObserver' in window) { io = new IntersectionObserver((es) => { V.visible = es[0].isIntersecting }); io.observe(host) }
  function frameScene(sc) {
    const d = (sc.span * 0.82 + 3) * Math.min(2.6, Math.max(1, 1.5 / (camera.aspect || 2)))
    camera.position.set(sc.center.x + d * 0.55, sc.center.y + d * 0.5, sc.center.z + d * 0.8)
    controls.target.copy(sc.center); controls.update()
  }
  function renderOnce() { if (V.current) { controls.update(); renderer.render(V.current.scene, camera) } }
  V.show = (key, grid) => {
    if (!V.scenes[key]) V.scenes[key] = grid ? buildTokenScene(grid) : (SCENES[key] ? SCENES[key]() : null)
    const sc = V.scenes[key]; if (!sc) return
    const changed = V.current !== sc; V.current = sc
    if (changed) frameScene(sc)
    resize(); renderOnce()
  }
  V.setLayer = (maxY) => { if (!V.current) return; V.current.layers.forEach((g) => { g.visible = maxY == null || g.userData.y <= maxY }); renderOnce() }
  V.reset = () => { if (V.current) { frameScene(V.current); renderOnce() } }
  controls.addEventListener('change', () => { if (reduceMotion) renderOnce() })
  let raf = 0
  function loop(now) {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - V.last) / 1000); V.last = now
    if (!V.visible || document.hidden || !V.current) return
    if (!reduceMotion) { V.clock += dt; V.current.anim.forEach((f) => f(V.clock, dt)) }
    controls.update(); renderer.render(V.current.scene, camera)
  }
  raf = requestAnimationFrame(loop)
  V.dispose = () => { cancelAnimationFrame(raf); ro.disconnect(); if (io) io.disconnect(); controls.dispose(); renderer.dispose(); renderer.domElement.remove() }
  return V
}
