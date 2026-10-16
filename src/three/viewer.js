// 3D build viewer. Blocks are built from the real Minecraft/mod models (public/mc, see tools/assets),
// placed with their real blockstate rotations, and the moving parts are animated the way the mods'
// own renderers do it (Create's deployer, press, saw, gearbox, pump, steam engine, arm; CDG's huge
// engine and pumpjack crank). Each moving part is posed with a matrix written in Minecraft's own
// block-space terms (0..1 per block), so the transform code can follow the mods' renderer code.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createModelKit } from './mcmodel.js'
import { ITEMS } from '../data/items'
import { iconCanvas } from '../lib/icons'

const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const PI = Math.PI, DEG = PI / 180
let KIT = null, KIT_READY = null, RENDERER = null

/* ---------------- small helpers ---------------- */
const GEO = {}, MAT = {}
function box(w, h, d) { const k = 'b' + w + '_' + h + '_' + d; return GEO[k] || (GEO[k] = new THREE.BoxGeometry(w, h, d)) }
function cyl(r, h, s) { const k = 'c' + r + '_' + h + '_' + (s || 12); return GEO[k] || (GEO[k] = new THREE.CylinderGeometry(r, r, h, s || 12)) }
function colorMat(key, color, extra) { return MAT[key] || (MAT[key] = new THREE.MeshLambertMaterial(Object.assign({ color }, extra || {}))) }
function mesh(geo, m, x, y, z) { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); return o }
function label(text, bg, fg, iconId) {
  const pad = iconId ? 44 : 0
  const w = Math.max(128, Math.ceil((text.length * 18 + 36 + pad) / 32) * 32)
  const c = document.createElement('canvas'); c.width = w; c.height = 64; const g = c.getContext('2d')
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  const draw = (img) => {
    g.clearRect(0, 0, w, 64)
    g.fillStyle = bg; g.beginPath(); if (g.roundRect) g.roundRect(4, 8, w - 8, 48, 12); else g.rect(4, 8, w - 8, 48); g.fill()
    g.fillStyle = fg; g.font = '600 28px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2 + pad / 2, 33)
    if (img) { g.imageSmoothingEnabled = false; g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(12, 14, 36, 36); g.drawImage(img, 0, 0, img.width, Math.min(img.width, img.height), 14, 16, 32, 32) }
    t.needsUpdate = true
  }
  draw(null)
  if (iconId) { // the item's icon: the site's rendered icon, else its stand-in
    const it = ITEMS[iconId], im = new Image()
    im.onload = () => draw(im)
    im.onerror = () => draw(iconCanvas(it ? it.icon : { shape: 'box', c: '#8a8f96' }))
    im.src = base() + 'icons/' + iconId.replace(':', '/') + '.png'
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }))
  s.scale.set(0.064 * w / 128, 0.032, 1); s.renderOrder = 10; return s
}
const LBL = { amber: ['#E3A93B', '#1B1406'], green: ['#3E9A5A', '#F2FBF3'], blue: ['#3B78C4', '#EEF4FB'], slate: ['#5B6774', '#F3F6F8'], oil: ['#3B362C', '#F2EED8'], red: ['#B9473C', '#FFF1EE'] }
function put(parent, obj, x, y, z) { obj.position.set(x, y, z); parent.add(obj); return obj }
function tag(scene, text, x, y, z, tone, iconId) { const [bg, fg] = LBL[tone || 'amber']; return put(scene, label(text, bg, fg, iconId), x, y, z) }

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

/* ---------------- Minecraft-style transforms ----------------
   MX builds a matrix by post-multiplying, like Create's TransformStack / SuperByteBuffer: the last call
   is applied to the vertices first. Units are blocks; c()/u() move to/from the block centre.
   Rotations are right-handed (same sense as JOML's rotateX/Y/Z). */
class MX {
  constructor() { this.m = new THREE.Matrix4() }
  mul(o) { this.m.multiply(o); return this }
  t(x, y, z) { return this.mul(new THREE.Matrix4().makeTranslation(x, y, z)) }
  c() { return this.t(0.5, 0.5, 0.5) }
  u() { return this.t(-0.5, -0.5, -0.5) }
  rx(r) { return this.mul(new THREE.Matrix4().makeRotationX(r)) }
  ry(r) { return this.mul(new THREE.Matrix4().makeRotationY(r)) }
  rz(r) { return this.mul(new THREE.Matrix4().makeRotationZ(r)) }
  rot(axis, r) { return axis === 'x' ? this.rx(r) : axis === 'y' ? this.ry(r) : this.rz(r) }
  rxd(d) { return this.rx(d * DEG) }
  ryd(d) { return this.ry(d * DEG) }
  rzd(d) { return this.rz(d * DEG) }
  s(k) { return this.mul(new THREE.Matrix4().makeScale(k, k, k)) }
}
const mx = () => new MX()
// Create's AngleHelper: the right-handed turn that makes a south-facing partial face `dir`
const H_ANGLE = { south: 0, west: -90, north: 180, east: 90, up: 0, down: 0 }
const V_ANGLE = { up: -90, down: 90 }
const AXIS_OF = { north: 'z', south: 'z', east: 'x', west: 'x', up: 'y', down: 'y' }
/** CachedBuffers.partialFacing: centre, rotateY(horizontal angle), rotateX(vertical angle), uncentre */
const facingMX = (dir) => mx().c().ryd(H_ANGLE[dir]).rxd(V_ANGLE[dir] || 0).u()
/** blockstate rotation {x, y} (Minecraft rotates clockwise, X first, then Y) */
const variantMX = (x, y) => mx().c().ryd(-y).rxd(-x).u()
const SHAFT_ROT = { x: [90, 90], y: [0, 0], z: [90, 180] } // from create:shaft's blockstate

/** a model in raw block space (0..1), posed by a matrix */
function raw(key) {
  const g = KIT && KIT.get(key)
  if (!g) return null
  g.position.set(0.5, 0.5, 0.5)
  const w = new THREE.Group(); w.add(g); w.matrixAutoUpdate = false
  return w
}
function part(parent, key, m, anim, fn) {
  const w = raw(key)
  if (!w) return null
  w.matrix.copy(m ? m.m : new THREE.Matrix4()); parent.add(w)
  if (fn && anim) anim.push((t) => { w.matrix.copy(fn(t).m) })
  return w
}
/** a block cell: children use block space, the cell sits at the grid position */
function cell(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x - 0.5, y - 0.5, z - 0.5); parent.add(g); return g }
const skey = (block, props) => 's:' + block + '[' + Object.keys(props).sort().map((k) => k + '=' + props[k]).join(',') + ']'
/** add a block by blockstate; `spin` = optional {axis, w} kinetic rotation of the whole model */
function state(parent, block, props, x, y, z, anim, spin) {
  const c = cell(parent, x, y, z)
  const parts = KIT ? KIT.states()[skey(block, props)] : null
  if (!parts) { c.add(mesh(box(1, 1, 1), colorMat('miss', 0x777c84), 0.5, 0.5, 0.5)); return c }
  for (const p of parts) {
    const b = variantMX(p.x, p.y)
    if (spin && anim) part(c, p.m, b, anim, (t) => mx().c().rot(spin.axis, t * spin.w).u().mul(b.m))
    else part(c, p.m, b)
  }
  return c
}
/** an item/block model by key, centred on the grid position (for blocks without a facing) */
function plain(parent, key, x, y, z, rot) {
  const g = KIT && KIT.get(key)
  const o = g || mesh(box(1, 1, 1), colorMat('miss', 0x777c84))
  if (rot) o.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0)
  return put(parent, o, x, y, z)
}

/* ---------------- kinetic parts ---------------- */
const W = PI // base angular speed: half a turn per second
function shaft(parent, axis, x, y, z, anim, dir = 1) { return state(parent, 'create:shaft', { axis }, x, y, z, anim, { axis, w: W * dir }) }
function cog(parent, axis, x, y, z, anim, dir = 1, large) { return state(parent, large ? 'create:large_cogwheel' : 'create:cogwheel', { axis }, x, y, z, anim, { axis, w: W * dir }) }
/** a spinning shaft model inside another block's cell (KineticBlockEntityRenderer's rotated shaft) */
function innerShaft(c, axis, anim, dir = 1) {
  const b = variantMX(...SHAFT_ROT[axis])
  return part(c, 'm:create:block/shaft', b, anim, (t) => mx().c().rot(axis, t * W * dir).u().mul(b.m))
}
/** a shaft half sticking out of a block towards `dir`, spinning */
function halfShaft(c, dir, anim, sign = 1) {
  const ax = AXIS_OF[dir], f = facingMX(dir)
  return part(c, 'm:create:block/shaft_half', f, anim, (t) => mx().c().rot(ax, t * W * sign).u().mul(f.m))
}
/** gearbox (axis y) with its four spinning half shafts, like GearboxRenderer */
function gearbox(parent, x, y, z, anim, dir = 1) {
  const c = state(parent, 'create:gearbox', { axis: 'y' }, x, y, z)
  for (const d of ['north', 'south', 'east', 'west']) halfShaft(c, d, anim, dir * (d === 'south' || d === 'east' ? 1 : -1))
  return c
}

/* ---------------- items ----------------
   Items are 3D like in game: flat item textures are pushed out to 1/16 thick (item/generated), block items
   use their block model. Items without a public texture use the site's stand-in pixel icon, pushed out the same way. */
const ITEM_PROTO = new Map()
function itemModel(id) {
  if (!KIT) return null
  let p = ITEM_PROTO.get(id)
  if (!p) {
    let g = null, block = false
    const info = KIT.info(id)
    if (info && info.flat) g = KIT.extruded(id)
    else if (info) { g = KIT.get(id); block = !!g }
    if (!g) {
      const it = ITEMS[id]
      const cv = iconCanvas(it ? it.icon : { shape: 'box', c: '#8a8f96' })
      const tex = new THREE.CanvasTexture(cv)
      tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.colorSpace = THREE.SRGBColorSpace
      g = new THREE.Group(); g.add(KIT.extrudeImage(cv, tex))
    }
    p = { g, block }; ITEM_PROTO.set(id, p)
  }
  const o = p.g.clone(); o.userData.block = p.block
  return o
}
/** Minecraft's FIXED display transform: item/generated turns 180° about Y, block models are drawn at half size */
const fixedMX = (block) => (block ? mx().s(0.5) : mx().ryd(180))
/** an item posed by a matrix in block space; `fn(t, block)` re-poses it every frame */
function itemPart(parent, id, fn, anim) {
  const o = itemModel(id); if (!o) return null
  const w = new THREE.Group(); w.matrixAutoUpdate = false; w.add(o); parent.add(w)
  const block = o.userData.block
  const set = (t) => w.matrix.copy(fn(t, block).mul(fixedMX(block).m).m)
  set(0.6); if (anim) anim.push((t) => set(t))
  return w
}

/* ---------------- machines ---------------- */
/** deployer facing down, shaft along x. DeployerRenderer moves pole + hand out along the facing and draws
    the held item 11/16 past the hand, lying flat. `ext(t)` is the extension 0..1. */
function deployer(parent, x, y, z, anim, ext, held) {
  const c = state(parent, 'create:deployer', { facing: 'down', axis_along_first: 'true' }, x, y, z)
  innerShaft(c, 'x', anim)
  const off = (t) => ext(t) * 12 / 16 // the hand comes down until the held item touches the item on the belt
  // DeployerRenderer.transform for facing=down: rotate Y 0, X 90, and Z 90 for the pole
  part(c, 'm:create:block/deployer/pole', null, anim, (t) => mx().t(0, -off(t), 0).c().rxd(90).rzd(90).u())
  part(c, 'm:create:block/deployer/hand_holding', null, anim, (t) => mx().t(0, -off(t), 0).c().rxd(90).u())
  // (in game the item sits 11/16 past the hand, inside the closed claw; drawn 3/16 lower here so it shows below the fingers)
  if (held) itemPart(c, held, (t, block) => mx().t(0.5, 0.5 - off(t), 0.5).ryd(180).rxd(270).t(0, 0, -(block ? 15 : 14) / 16).s(block ? 0.75 - 1 / 64 : 0.5), anim)
  return c
}
/** press facing east (shaft along x); head drops 19/16 blocks onto the belt, like MechanicalPressRenderer */
function press(parent, x, y, z, anim, ext) {
  const c = state(parent, 'create:mechanical_press', { facing: 'east' }, x, y, z)
  innerShaft(c, 'x', anim)
  const f = facingMX('east')
  part(c, 'm:create:block/mechanical_press/head', f, anim, (t) => mx().t(0, -ext(t) * 19 / 16, 0).mul(f.m))
  return c
}
/** saw facing up with its blade partial (the blade texture is animated) and a spinning shaft along z */
function saw(parent, x, y, z, anim) {
  const c = state(parent, 'create:mechanical_saw', { facing: 'up', axis_along_first: 'false', flipped: 'false' }, x, y, z)
  part(c, 'm:create:block/mechanical_saw/blade_vertical_active', facingMX('up'))
  innerShaft(c, 'z', anim, -1)
  return c
}
/** mechanical pump with its spinning cog (PumpRenderer: partialFacing + kinetic rotation) */
function pump(parent, facing, x, y, z, anim) {
  const c = state(parent, 'create:mechanical_pump', { facing }, x, y, z)
  const f = facingMX(facing), ax = AXIS_OF[facing]
  part(c, 'm:create:block/mechanical_pump/cog', f, anim, (t) => mx().c().rot(ax, t * W * 2).u().mul(f.m))
  return c
}
/** Create steam engine on a boiler wall, animated as in SteamEngineRenderer */
function steamEngine(parent, facing, x, y, z, anim, phase) {
  const c = state(parent, 'create:steam_engine', { face: 'wall', facing, waterlogged: 'false' }, x, y, z)
  const tr = () => mx().c().ryd(H_ANGLE[facing]).rxd((V_ANGLE[facing] || 0) + 90).u()
  const ang = (t) => t * W + phase
  const pis = (a) => (6 / 16) * Math.sin(a) - Math.sqrt((14 / 16) ** 2 - (6 / 16) ** 2 * Math.cos(a) ** 2)
  part(c, 'm:create:block/steam_engine/piston', null, anim, (t) => tr().t(0, pis(ang(t)) + 20 / 16, 0))
  part(c, 'm:create:block/steam_engine/linkage', null, anim, (t) => {
    const a = ang(t), p = pis(a), dist = Math.abs(p - 6 / 16 * Math.sin(a))
    const a2 = Math.acos(Math.min(1, dist / (14 / 16))) * (Math.cos(a) >= 0 ? 1 : -1)
    return tr().c().t(0, 1, 0).u().t(0, p + 20 / 16, 0).t(0, 4 / 16, 8 / 16).rx(a2).t(0, -4 / 16, -8 / 16)
  })
  part(c, 'm:create:block/steam_engine/shaft_connector', null, anim, (t) => tr().t(0, 2, 0).c().rx(-(ang(t) + PI / 2)).u())
  return c
}
/** CDG huge diesel engine facing its shaft, animated as in HugeDieselEngineRenderer */
function hugeEngine(parent, facing, x, y, z, anim, phase, connector) {
  const c = state(parent, 'createdieselgenerators:huge_diesel_engine', { facing, powered: 'true' }, x, y, z)
  const tr = () => mx().c().ryd(H_ANGLE[facing]).rxd((V_ANGLE[facing] || 0) + 90).u()
  const ang = (t) => t * W * 2 + phase
  const pis = (a) => (1 - Math.sin(a)) / 4 + 0.4375
  part(c, 'm:createdieselgenerators:block/huge_diesel_engine/piston', null, anim, (t) => tr().t(0, pis(ang(t)), 0))
  part(c, 'm:createdieselgenerators:block/huge_diesel_engine/linkage', null, anim, (t) => {
    const a = ang(t)
    return tr().c().t(0, 1, 0).u().t(0, pis(a), 0).t(0, 4 / 16, 8 / 16).rxd(Math.sin(a - PI / 2) * 23).t(0, -4 / 16, -8 / 16)
  })
  if (connector) part(c, 'm:createdieselgenerators:block/huge_diesel_engine/shaft_connector', null, anim, (t) => tr().t(0, 2, 0).c().rx(-ang(t) + PI / 2).u())
  return c
}
/** Crafts & Additions alternator; its shaft half sticks out of the facing side */
function alternator(parent, facing, x, y, z, anim) {
  const c = state(parent, 'createaddition:alternator', { facing }, x, y, z)
  halfShaft(c, facing, anim, 4)
  return c
}
/** Create mechanical arm doing ArmRenderer's idle ("rave") motion */
function arm(parent, x, y, z, anim) {
  const c = state(parent, 'create:mechanical_arm', { ceiling: 'false' }, x, y, z)
  part(c, 'm:create:block/mechanical_arm/cog', null, anim, (t) => mx().c().ry(t * W).u())
  const lerp = (k, a, b) => a + (b - a) * k
  const chain = (t, n) => {
    const r = t * 8
    const base = (r * 10) % 360, lower = lerp((Math.sin(r / 4) + 1) / 2, -45, 15), upper = lerp((Math.sin(r / 8) + 1) / 4, -45, 95), head = -lower
    const m = mx().c().t(0, 4 / 16, 0).ryd(base)
    if (n > 0) m.t(0, 2 / 16, 0).rxd(lower + 135)
    if (n > 1) m.t(0, 0, -14 / 16).rxd(upper - 90)
    if (n > 2) m.t(0, 0, -15 / 16).rxd(head - 45)
    return m
  }
  part(c, 'm:create:block/mechanical_arm/base', null, anim, (t) => chain(t, 0))
  part(c, 'm:create:block/mechanical_arm/lower_body', null, anim, (t) => chain(t, 1))
  part(c, 'm:create:block/mechanical_arm/upper_body', null, anim, (t) => chain(t, 2))
  part(c, 'm:create:block/mechanical_arm/claw_base', null, anim, (t) => chain(t, 3))
  part(c, 'm:create:block/mechanical_arm/lower_claw_grip', null, anim, (t) => chain(t, 3).t(0, -1 / 16, -6 / 16))
  part(c, 'm:create:block/mechanical_arm/upper_claw_grip', null, anim, (t) => chain(t, 3).t(0, 1 / 16, -6 / 16))
  return c
}
function burner(parent, x, y, z) { return plain(parent, 'b:burner_lit', x, y, z) }
function tankCol(parent, x, z, y0, h) {
  for (let y = y0; y < y0 + h; y++) state(parent, 'create:fluid_tank', { bottom: String(y === y0), top: String(y === y0 + h - 1), shape: 'window' }, x, y, z)
}
function chest(parent, x, y, z, rotY) { const g = plain(parent, 'b:chest', x, y, z); if (rotY) g.rotation.y = rotY; return g }

/* ---------------- fluids ---------------- */
function animTex(path, frames) {
  const key = 'rt:' + path
  if (MAT[key]) return MAT[key]
  const t = KIT.texture('tex/' + path + '.png').clone()
  t.repeat.set(1, 1 / frames); t.offset.set(0, 1 - 1 / frames)
  t.userData = { frames }
  return (MAT[key] = t)
}
const waterMat = () => MAT.water || (MAT.water = KIT ? new THREE.MeshLambertMaterial({ map: animTex('minecraft/block/water_still', 32), color: 0x3f76e4, transparent: true, opacity: 0.75, depthWrite: false }) : colorMat('w2', 0x3f86d8, { transparent: true, opacity: 0.45 }))
const lavaMat = () => MAT.lava || (MAT.lava = KIT ? new THREE.MeshLambertMaterial({ map: animTex('minecraft/block/lava_still', 20), emissive: 0x3a1400 }) : colorMat('l2', 0xff7a1a))
function water(parent, x, y, z) { return put(parent, new THREE.Mesh(box(1, 1, 1), waterMat()), x, y, z) }
function lava(parent, x, y, z) { return put(parent, new THREE.Mesh(box(1, 1, 1), lavaMat()), x, y, z) }

/* ---------------- belts ----------------
   Create's belt partials (start / middle / end, top and bottom run) turned to the way the belt moves, with
   the texture swapped for belt_scroll and scrolled the way BeltRenderer shifts it; pulleys spin with the belt. */
const BELT_FACING = { '>': 'east', '<': 'west', '^': 'north', v: 'south' }
const BELT_VEC = { '>': [1, 0], '<': [-1, 0], '^': [0, -1], v: [0, 1] }
function beltMat(bottom) {
  const k = 'belt' + (bottom ? 'B' : 'T')
  if (MAT[k]) return MAT[k]
  const t = KIT.texture('tex/create/block/belt_scroll.png').clone()
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 0.5); t.offset.set(0, bottom ? 0.25 : 0.5)
  MAT[k + 'tex'] = t
  return (MAT[k] = new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.1, side: THREE.DoubleSide }))
}
/** scroll every belt texture to `d` blocks travelled */
function scrollBelts(d) {
  if (MAT.beltTtex) MAT.beltTtex.offset.y = 0.5 - 0.5 * (d % 2)
  if (MAT.beltBtex) MAT.beltBtex.offset.y = 0.5 - 0.5 * ((d + 0.5) % 2)
}
function beltTile(parent, dir, partName, x, y, z, anim, pulley, travel) {
  const facing = BELT_FACING[dir], c = cell(parent, x, y, z)
  const f = mx().c().ryd(H_ANGLE[facing]).u()
  if (!KIT) { c.add(mesh(box(1, 0.4, 1), colorMat('beltside', 0x2c3036), 0.5, 0.6, 0.5)); return c }
  for (const bottom of [false, true]) {
    const w = part(c, 'm:create:block/belt/' + partName + (bottom ? '_bottom' : ''), f)
    if (w) w.traverse((o) => { if (o.isMesh && o.material.map && o.material.map.image && /belt\.png$/.test(o.material.map.image.src || '')) o.material = beltMat(bottom) })
  }
  if (pulley) { // BeltRenderer: centre, (axis X: rotate Y 90), rotate X 90, uncentre; then the kinetic spin
    const ax = AXIS_OF[facing] === 'x' ? 'z' : 'x'
    const base = mx().c(); if (ax === 'x') base.ryd(90); base.rxd(90).u()
    const sgn = dir === '<' || dir === 'v' ? 1 : -1
    part(c, 'm:create:block/belt_pulley', base, anim, (t) => mx().c().rot(ax, sgn * travel(t) / (5 / 16)).u().mul(base.m))
  }
  return c
}

/* ---------------- pipes ----------------
   Fluid pipes join up like in game: each pipe connects to neighbouring pipes, to the blocks marked as ports
   (tanks, engines, water) and to pumps along the pump's axis. A pipe with one connection runs straight through. */
const DIRS6 = { north: [0, 0, -1], south: [0, 0, 1], east: [1, 0, 0], west: [-1, 0, 0], up: [0, 1, 0], down: [0, -1, 0] }
const OPP = { north: 'south', south: 'north', east: 'west', west: 'east', up: 'down', down: 'up' }
function pipeNet() {
  const pipes = new Map(), ports = new Map(), pumps = new Map()
  const K = (x, y, z) => x + ',' + y + ',' + z
  const N = {
    pipe(x, y, z) { pipes.set(K(x, y, z), [x, y, z]); return N },
    /** straight run between two points (inclusive) */
    run(a, b) {
      const d = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1]), Math.sign(b[2] - a[2])]
      const p = [...a]
      for (;;) { N.pipe(...p); if (p[0] === b[0] && p[1] === b[1] && p[2] === b[2]) break; p[0] += d[0]; p[1] += d[1]; p[2] += d[2] }
      return N
    },
    /** a block pipes attach to; `faces` limits which of its faces accept a pipe */
    port(x, y, z, faces) { ports.set(K(x, y, z), faces || null); return N },
    pump(facing, x, y, z) { pumps.set(K(x, y, z), facing); return N },
    build(scene, anim) {
      const S = KIT ? KIT.states() : {}
      for (const [x, y, z] of pipes.values()) {
        const con = {}
        for (const [d, v] of Object.entries(DIRS6)) {
          const k = K(x + v[0], y + v[1], z + v[2])
          const port = ports.get(k), pf = pumps.get(k)
          con[d] = pipes.has(k) || (ports.has(k) && (port === null || port.includes(OPP[d]))) || (pf !== undefined && AXIS_OF[pf] === AXIS_OF[d])
        }
        const on = Object.keys(con).filter((d) => con[d])
        if (on.length === 0) { con.up = con.down = true }
        if (on.length === 1) con[OPP[on[0]]] = true
        const props = {}; for (const d of Object.keys(DIRS6)) props[d] = String(!!con[d])
        if (!S[skey('create:fluid_pipe', props)]) { for (const d of ['down', 'up', 'west', 'east']) { if (props[d] === 'true' && S[skey('create:fluid_pipe', { ...props, [d]: 'false' })]) { props[d] = 'false'; break } } }
        const c = state(scene, 'create:fluid_pipe', props, x, y, z)
        // the pieces Create's PipeAttachmentModel adds per open side (FluidPipeBlockEntity.getRenderedRimAttachment)
        const open = Object.keys(DIRS6).filter((d) => props[d] === 'true')
        const straight = open.length === 2 && OPP[open[0]] === open[1] ? AXIS_OF[open[0]] : null
        for (const d of open) {
          const v = DIRS6[d], k = K(x + v[0], y + v[1], z + v[2])
          let kinds
          if (pipes.has(k)) kinds = straight === AXIS_OF[d] ? ['connection'] : ['rim_connector']
          else if (pumps.has(k)) kinds = ['rim_connector'] // DETAILED_CONNECTION on both sides of a pump
          else if (ports.has(k)) kinds = ['rim_connector', 'drain']
          else kinds = ['rim_connector', 'rim']
          for (const kd of kinds) part(c, 'm:create:block/fluid_pipe/' + kd + '/' + d)
        }
      }
      for (const [k, f] of pumps) {
        const [x, y, z] = k.split(',').map(Number), c = pump(scene, f, x, y, z, anim)
        for (const d of [f, OPP[f]]) { const v = DIRS6[d]; if (ports.has(K(x + v[0], y + v[1], z + v[2]))) { part(c, 'm:create:block/fluid_pipe/rim_connector/' + d); part(c, 'm:create:block/fluid_pipe/drain/' + d) } }
      }
    },
  }
  return N
}

/* ---------------- token-grid builds ----------------
   Items index along the belt the way they do in game: they ride one block, then wait under the stations
   while the deployers / presses / saw work on them, then ride on. Every station acts during the wait. */
const CYCLE = 1.6, MOVE = 0.6
const smooth = (k) => k * k * (3 - 2 * k)
function cyc(t) {
  const n = Math.floor(t / CYCLE), f = t - n * CYCLE
  return { n, move: f < MOVE ? smooth(f / MOVE) : 1, wait: f < MOVE ? -1 : (f - MOVE) / (CYCLE - MOVE) }
}
/** deployer / press extension during the wait: out, hold, back */
const extOf = (w, press) => (w < 0 ? 0 : w < 0.35 ? (press ? Math.pow(w / 0.35, 3) : smooth(w / 0.35)) : w < 0.55 ? 1 : w < 0.9 ? 1 - smooth((w - 0.55) / 0.35) : 0)

function neighborChest(L, zi, xi) {
  const rows = L.rows.map((r) => r.split(' '))
  for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const t = rows[zi + d[1]] && rows[zi + d[1]][xi + d[0]]; if (t === 'Ci' || t === 'Co') return d }
  return null
}
function powerIn() {
  const g = new THREE.Group(), m = colorMat('green', 0x4f9c5c)
  g.add(mesh(cyl(0.14, 1), m))
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 12), m); cone.rotation.x = PI; cone.position.y = 0.85; g.add(cone)
  const pl = label('POWER', ...LBL.green); pl.position.set(0, 1.45, 0); g.add(pl)
  return g
}
function beltPart(L, zi, xi, d) {
  const rows = L.rows.map((r) => r.split(' ')), v = BELT_VEC[d]
  const at = (dx, dz) => { const t = rows[zi + dz] && rows[zi + dz][xi + dx]; return t && t[0] === 'B' && t[1] === d }
  const prev = at(-v[0], -v[1]), next = at(v[0], v[1])
  return !prev ? 'start' : !next ? 'end' : 'middle'
}
function tokenBlock(S, tok, L, zi, xi, x, y, z, anim, ctx) {
  if (tok[0] === 'B' && '<>^v'.includes(tok[1])) {
    const d = tok[1], f = tok.slice(2)
    beltTile(S, d, beltPart(L, zi, xi, d), x, y, z, anim, f.includes('*'), ctx.travel)
    if (/[iob]/.test(f)) { // belt funnel: sits on top of the belt's end tile, its back against the chest
      const nb = neighborChest(L, zi, xi)
      if (nb) {
        const facing = nb[0] === -1 ? 'east' : nb[0] === 1 ? 'west' : nb[1] === -1 ? 'south' : 'north'
        state(S, f.includes('b') ? 'create:brass_belt_funnel' : 'create:andesite_belt_funnel', { facing, powered: 'false', shape: 'retracted', waterlogged: 'false' }, x, y + 1, z)
      }
    }
    return
  }
  const st = ctx.station(tok, x, z)
  switch (tok) {
    case 'Ci': case 'Co': { chest(S, x, y, z); tag(S, tok === 'Ci' ? 'IN' : 'OUT', x, y + 0.8, z, 'oil'); return }
    case 'G': gearbox(S, x, y, z, anim); return
    case 'S-': shaft(S, 'x', x, y, z, anim); return
    case 'S|': shaft(S, 'z', x, y, z, anim); return
    case 'So': shaft(S, 'y', x, y, z, anim); return
    case 'Pw': put(S, powerIn(), x, y, z); return
    case 'H': state(S, 'minecraft:hopper', { facing: 'down', enabled: 'true' }, x, y, z); return
    case 'X': saw(S, x, y, z, anim); tag(S, 'SAW', x, y + 0.9, z - 0.2, 'slate'); return
    case 'c': cog(S, 'z', x, y, z, anim, xi % 2 ? 1 : -1); return
    case 'Tg': plain(S, 'b:thermo', x, y, z); return
    case 'Lv': lava(S, x, y, z); return
    case 'Wa': water(S, x, y, z); return
    case 'St': plain(S, 'b:stone', x, y, z); return
    case 'Gl': plain(S, 'b:glass', x, y, z); return
    case 'Cn': state(S, 'immersiveengineering:connector_lv', { facing: 'north' }, x, y, z); return
  }
  if (/^P\d?$/.test(tok)) { press(S, x, y, z, anim, (t) => (st.busy(t) ? extOf(cyc(t).wait, true) : 0)); return }
  if (/^[DS]\d$/.test(tok)) {
    const held = ctx.held(tok)
    deployer(S, x, y, z, anim, (t) => (st.busy(t) ? extOf(cyc(t).wait) : 0), held)
    tag(S, tok, x, y + 0.75, z - 0.6, 'amber', held || undefined)
  }
}
/** an item lying on a belt, as BeltRenderer draws it: 15/16 up from the belt's base, flat items laid down */
function beltItem(id) {
  const w = new THREE.Group(); w.matrixAutoUpdate = false
  const o = itemModel(id)
  if (!o) { const b = new THREE.Mesh(box(0.3, 0.1, 0.3), colorMat('itm', 0xb8bec2)); b.position.y = 0.36; w.add(b); return w }
  const block = o.userData.block
  const m = mx().t(0, -0.5 + 15 / 16, 0)
  if (!block) m.t(0, -3 / 32, 0).rxd(90)
  m.s(0.5).mul(fixedMX(block).m)
  const inner = new THREE.Group(); inner.matrixAutoUpdate = false; inner.matrix.copy(m.m); inner.add(o); w.add(inner)
  return w
}
const BELT_ITEM = { plate: 'immersiveengineering:plate_steel', casing: 'deceasedcraft:bullet_casing_9mm_round', box: 'apocalypsenow:cardboard_box' }
function buildTokenScene(G, load) {
  const scene = baseScene(), anim = [], layerGroups = []
  load = load || {}
  // path: belt route, in block steps
  const pts = (G.path || []).map((p) => new THREE.Vector3(p[0], 0, p[1]))
  const segs = []; let total = 0
  for (let i = 0; i < pts.length - 1; i++) { const len = pts[i].distanceTo(pts[i + 1]); segs.push({ a: pts[i], b: pts[i + 1], len, start: total }); total += len }
  const sOf = (x, z) => { for (const sg of segs) { const d = new THREE.Vector3(x, 0, z).sub(sg.a), dir = sg.b.clone().sub(sg.a).normalize(), k = d.dot(dir); if (k >= -0.01 && k <= sg.len + 0.01 && d.clone().sub(dir.clone().multiplyScalar(k)).length() < 0.01) return sg.start + k } return null }
  const spacing = G.loop ? Math.max(1, Math.round(total / 5)) : 1
  const itemsAt = (t) => { // path positions of all items at time t
    const c = cyc(t), out = []
    if (G.loop) { for (let s0 = 0, k = 0; s0 < total; s0 += spacing, k++) out.push({ s: ((s0 + c.n + c.move) % total + total) % total, key: k }) }
    else for (let i = 0; i <= total + 1; i++) { const s = i - 1 + c.move; if (s >= 0 && s <= total + 0.001) out.push({ s, key: c.n - i }) }
    return out
  }
  const stations = {}
  const ctx = {
    travel: (t) => t / CYCLE, // belt surface: one block per cycle, never stopping
    held: (name) => (load.held && name in load.held ? load.held[name] : null),
    station(name, x, z) {
      const s = sOf(x, z)
      const st = { name, s, busy: (t) => s != null && cyc(t).wait >= 0 && itemsAt(t).some((p) => Math.abs(p.s - s) < 0.02) }
      stations[name] = st
      return st
    },
  }
  let minX = 99, maxX = -99, minZ = 99, maxZ = -99, maxY = 0
  G.layers.forEach((L) => {
    const lg = new THREE.Group(); lg.userData.y = L.y
    L.rows.forEach((row, zi) => row.split(' ').forEach((tok, xi) => {
      if (tok === '.' || tok === '~') return
      const z = G.zs[zi]
      tokenBlock(lg, tok, L, zi, xi, xi, L.y, z, anim, ctx)
      minX = Math.min(minX, xi); maxX = Math.max(maxX, xi); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); maxY = Math.max(maxY, L.y)
    }))
    scene.add(lg); layerGroups.push(lg)
  })
  addGround(scene, minX, maxX, minZ, maxZ)
  anim.push((t) => scrollBelts(ctx.travel(t)))
  if (segs.length) {
    // what the item looks like at each point of the route: the input, then each station's product
    const base = load.input || BELT_ITEM[G.item] || G.item
    const swaps = (load.swaps || []).map(([st, id]) => [stations[st] ? stations[st].s : null, id]).filter((x) => x[0] != null).sort((a, b) => a[0] - b[0])
    const idAt = (s, wait) => { let id = base; for (const [ss, sid] of swaps) if (s > ss + 0.02 || (Math.abs(s - ss) <= 0.02 && wait > 0.5)) id = sid; return id }
    const slots = []
    const nSlots = G.loop ? Math.ceil(total / spacing) : Math.ceil(total) + 2
    for (let j = 0; j < nSlots; j++) { const g = new THREE.Group(); scene.add(g); slots.push({ g, models: {} }) }
    const place = (t) => {
      const ps = itemsAt(t), w = cyc(t).wait
      slots.forEach((sl, j) => {
        if (!ps[j]) { sl.g.visible = false; return }
        const s = ps[j].s
        sl.g.rotation.y = (((ps[j].key * 137) % 360) + 360) % 360 * DEG
        sl.g.visible = true
        let p = pts[0]
        for (const sg of segs) if (s <= sg.start + sg.len + 1e-6) { p = sg.a.clone().lerp(sg.b, (s - sg.start) / sg.len); break }
        sl.g.position.set(p.x, G.beltY || 0, p.z)
        const id = idAt(s, w)
        for (const k in sl.models) sl.models[k].visible = k === id
        if (!sl.models[id]) { sl.models[id] = beltItem(id); sl.g.add(sl.models[id]) }
      })
    }
    anim.push(place); place(0.6)
  }
  return { scene, anim, layers: layerGroups, center: new THREE.Vector3((minX + maxX) / 2, maxY / 2, (minZ + maxZ) / 2), span: Math.max(maxX - minX + 1, (maxZ - minZ + 1) * 1.4, (maxY + 1) * 2) }
}

/* ---------------- power builds ---------------- */
function boilerScene(o) {
  const scene = baseScene(), anim = [], Wd = o.w, H = o.h
  for (let x = 0; x < Wd; x++) for (let z = 0; z < Wd; z++) { burner(scene, x, 0, z); tankCol(scene, x, z, 1, H) }
  let ph = 0
  o.faces.forEach((fz) => {
    const facing = fz < 0 ? 'north' : 'south'
    const ez = fz < 0 ? -1 : Wd, sz = fz < 0 ? -3 : Wd + 2
    o.rows.forEach((y) => {
      for (let x = 0; x < Wd; x++) { steamEngine(scene, facing, x, y, ez, anim, ph += 1.3); shaft(scene, 'x', x, y, sz, anim) }
      gearbox(scene, Wd, y, sz, anim)
    })
  })
  if (o.faces.length > 1) for (let z2 = -2; z2 <= Wd + 1; z2++) shaft(scene, 'z', Wd, o.rows[0], z2, anim)
  const outY = o.rows[0], outZ = o.faces[0] < 0 ? -3 : Wd + 2
  for (let xo = Wd + 1; xo <= Wd + 2; xo++) shaft(scene, 'x', xo, outY, outZ, anim)
  tag(scene, o.out, Wd + 2.5, outY + 1.1, outZ, 'green')
  // water: a pipe dips into a 2×2 pool (endless water), a pump pushes it up into the boiler's side
  const net = pipeNet()
  for (let x = 0; x < Wd; x++) for (let z = 0; z < Wd; z++) for (let y = 1; y <= H; y++) net.port(x, y, z)
  o.pumps.forEach((pz) => {
    net.run([-5, 1, pz], [-5, 2, pz]).run([-4, 2, pz], [-4, 2, pz]).pump('east', -3, 2, pz).run([-2, 2, pz], [-1, 2, pz])
    for (let wx = -6; wx <= -5; wx++) for (let wz = pz; wz <= pz + 1; wz++) water(scene, wx, 0, wz)
    tag(scene, '2×2 POOL', -5.5, 3.3, pz + 0.5, 'blue')
  })
  net.build(scene, anim)
  arm(scene, o.arm[0], 0, o.arm[1], anim)
  chest(scene, o.arm[0] + 1, 0, o.arm[1])
  tag(scene, o.cake ? 'ARM + CAKES' : 'ARM + COAL', o.arm[0] + 0.5, 1.8, o.arm[1] - 0.6, 'slate')
  tag(scene, 'LEVEL ' + o.level, (Wd - 1) / 2, H + 1.2, (Wd - 1) / 2)
  addGround(scene, -6, Wd + 2, -3, Wd + 2)
  return { scene, anim, layers: [], center: new THREE.Vector3(Wd / 2 - 1.5, H / 2, Wd / 2 - 0.5), span: Wd + 10 }
}

function bankScene(n, out) {
  const scene = baseScene(), anim = []
  // boiler shaft at 64 RPM -> two large-to-small cog steps -> 256 RPM -> gearbox row
  shaft(scene, 'x', -6, 0, -1, anim, 0.25)
  cog(scene, 'x', -5, 0, -1, anim, 0.25, true)
  cog(scene, 'x', -5, 0, 0.5, anim, -0.5)
  shaft(scene, 'x', -4, 0, 0.5, anim, -0.5)
  cog(scene, 'x', -3, 0, 0.5, anim, -0.5, true)
  cog(scene, 'x', -3, 0, 2, anim, 1)
  shaft(scene, 'x', -2, 0, 2, anim, 1); shaft(scene, 'x', -1, 0, 2, anim, 1)
  tag(scene, 'BOILER 64 → 256 RPM', -4, 2.2, 0.5, 'slate')
  for (let x = 0; x < n; x++) {
    gearbox(scene, x, 0, 2, anim, 1)
    alternator(scene, 'south', x, 0, 1, anim)
    alternator(scene, 'north', x, 0, 3, anim)
  }
  tag(scene, (2 * n) + ' × 180 = ' + (2 * n * 180).toLocaleString('en-US') + ' FE/t', (n - 1) / 2, 1.9, 2)
  tag(scene, out, (n - 1) / 2, 1.3, 4.2, 'green')
  addGround(scene, -7, n, -2, 5)
  return { scene, anim, layers: [], center: new THREE.Vector3((n - 7) / 2, 0.5, 1.5), span: n + 7 }
}

function dieselScene() {
  const scene = baseScene(), anim = [], net = pipeNet()
  // ---- engine row: 10-long shaft at z0, engines 2 blocks out on both sides, facing the shaft (as in CDG's ponder)
  let ph = 0
  for (let x = 0; x < 10; x++) {
    shaft(scene, 'x', x, 1, 0, anim, 2)
    hugeEngine(scene, 'south', x, 1, -2, anim, ph += 0.7, true)
    hugeEngine(scene, 'north', x, 1, 2, anim, ph += 0.7, false)
    net.port(x, 1, -2, ['up']).port(x, 1, 2, ['up'])
  }
  // fuel rails on top of both engine rows, fed from one manifold
  net.run([-1, 2, -2], [9, 2, -2]).run([-1, 2, 2], [9, 2, 2]).run([-1, 2, -1], [-1, 2, 1])
  cog(scene, 'x', 10, 1, 0, anim, 2, true)
  shaft(scene, 'x', 11, 1, 0, anim, 2)
  tag(scene, '327,680 SU', 11.5, 2.6, 0, 'green')
  tag(scene, '20 HUGE ENGINES · 16,384 SU EACH', 4.5, 3.6, 0)
  net.pump('east', -2, 2, 0)
  tankCol(scene, -3, 0, 0, 4); for (let y = 0; y < 4; y++) net.port(-3, y, 0)
  tag(scene, 'DIESEL', -3, 5.0, 0, 'oil')
  // ---- distillation: two 1×1×3 towers on heated burners. Crude goes in at the bottom level, diesel comes
  // out of the middle level, gasoline out of the top
  const TX = -6
  ;[-1, 1].forEach((tz) => {
    burner(scene, TX, 0, tz)
    for (let y = 1; y <= 3; y++) { plain(scene, 'b:distill', TX, y, tz); net.port(TX, y, tz) }
  })
  net.run([TX + 1, 2, -1], [TX + 1, 2, 1]).pump('east', TX + 2, 2, 0)
  tag(scene, '2 DISTILLATION TOWERS', TX, 5.6, 0, 'slate')
  net.run([TX, 4, -1], [TX, 4, 1]).pump('north', TX, 4, -2).pipe(TX, 4, -3)
  tankCol(scene, TX, -4, 0, 5); for (let y = 0; y < 5; y++) net.port(TX, y, -4)
  tag(scene, 'GASOLINE', TX, 5.8, -4, 'oil')
  // crude buffer tank and the feed into the towers
  tankCol(scene, TX - 3, 0, 0, 3); for (let y = 0; y < 3; y++) net.port(TX - 3, y, 0)
  tag(scene, 'CRUDE', TX - 3, 3.8, 0, 'oil')
  net.pipe(TX, 1, 0).pump('east', TX - 1, 1, 0).pipe(TX - 2, 1, 0)
  // ---- pumpjack (layout from CDG's ponder), arm along x
  const HX = -20, PX = HX + 4, CX = PX + 4
  plain(scene, 'b:pumpjack_hole', HX, 0, 0); net.port(HX, 0, 0)
  net.run([HX, -1, 0], [HX, -9, 0])
  tag(scene, 'PIPES TO BEDROCK', HX - 1.5, -5, 0, 'oil')
  net.run([HX, 0, 1], [HX, 0, 2]).pump('east', HX + 1, 0, 2).run([HX + 2, 0, 2], [TX - 4, 0, 2]).run([TX - 4, 0, 1], [TX - 4, 0, 0])
  for (let y = 0; y < 3; y++) { plain(scene, 'b:scaffold', PX, y, -1); plain(scene, 'b:scaffold', PX, y, 1) }
  state(scene, 'createdieselgenerators:pumpjack_bearing', { facing: 'south' }, PX, 3, -1)
  tag(scene, 'PUMPJACK', PX, 6.4, 0, 'slate')
  // crank: CDG's PumpjackCrankRenderer turns the counterweight around (0.5, 1.25) in the crank's block
  const crankAng = (t) => t * 90 // degrees
  const crankC = state(scene, 'createdieselgenerators:pumpjack_crank', { facing: 'east' }, CX, 0, 0)
  part(crankC, 'm:createdieselgenerators:block/pumpjack_crank/small_counterweight', null, anim, (t) => mx().t(0.5, 1.25, 0).rzd(crankAng(t)))
  // the rocking arm hangs on the bearing at (PX, 3); its far end follows the crank pin
  const armG = new THREE.Group(); armG.position.set(PX, 3, 0); scene.add(armG)
  const armBlock = (key, dx, rot) => { const g = KIT && KIT.get(key); if (g) { if (rot) g.rotation.set(...rot); g.position.x = dx; armG.add(g) } }
  const head = new THREE.Group(); head.position.x = -4; armG.add(head)
  state(head, 'createdieselgenerators:pumpjack_head', { facing: 'east', waterlogged: 'false' }, 0, 0, 0)
  armBlock('b:industrial_iron', -3); armBlock('b:industrial_iron', 0)
  for (const dx of [-2, -1, 1, 2, 3]) armBlock('b:girder', dx, [0, 0, PI / 2])
  const zb = KIT && KIT.get('b:zinc_block'); if (zb) { zb.position.z = 1; armG.add(zb) }
  const bB = new THREE.Group(); bB.position.x = 4; armG.add(bB)
  state(bB, 'createdieselgenerators:pumpjack_bearing', { facing: 'south' }, 0, 0, 0)
  const pin = (t) => { const v = (crankAng(t) + 90) * DEG; return [0.8125 * Math.cos(v), 0.8125 * Math.sin(v)] }
  const armTilt = (t) => Math.asin(Math.max(-1, Math.min(1, pin(t)[1] / 4)))
  anim.push((t) => { armG.rotation.z = armTilt(t) })
  part(crankC, 'm:createdieselgenerators:block/pumpjack_crank/small_rod', null, anim, (t) => {
    const [cx, sy] = pin(t), a = armTilt(t)
    const endX = (PX + 4 * Math.cos(a)) - (CX - 0.5), endY = (3 + 4 * Math.sin(a)) + 0.5
    const dx = endX - (0.5 + cx), dy = endY - (1.25 + sy)
    return mx().t(0.5, 1.25, 0).t(cx, sy, 0).rz(Math.atan2(dy, dx) - PI / 2)
  })
  net.build(scene, anim)
  const gnd = new THREE.Mesh(box(30, 0.05, 10), new THREE.MeshLambertMaterial({ color: 0x5e6a52, transparent: true, opacity: 0.25, depthWrite: false }))
  gnd.position.set(-5, -0.52, 0); scene.add(gnd)
  addGround(scene, HX - 1, 12, -4, 4)
  return { scene, anim, layers: [], center: new THREE.Vector3(-4, 1, 0), span: 30 }
}

const SCENES = {
  wheels() {
    const scene = baseScene(), anim = []
    // wheel centres at y2: the 3x3 wheel sits on the ground, its paddles reach 2 blocks out into the water
    ;[0, 2, 4].forEach((x) => {
      state(scene, 'create:large_water_wheel', { axis: 'x', extension: 'false' }, x, 2, 0, anim, { axis: 'x', w: -0.4 })
      for (let z = -1; z <= 1; z++) water(scene, x, 4, z)
      for (let y = 3; y >= 1; y--) water(scene, x, y, 2)
      tag(scene, '512 SU', x, 5.3, 0)
    })
    ;[1, 3, 5].forEach((x) => shaft(scene, 'x', x, 2, 0, anim, -0.4))
    gearbox(scene, 6, 2, 0, anim, 0.4)
    plain(scene, 'b:stone', 6, 1, 0); plain(scene, 'b:stone', 6, 0, 0)
    tag(scene, '1,536 SU @ 4 RPM', 6.5, 3.4, 0, 'green')
    addGround(scene, -1, 7, -2, 3)
    return { scene, anim, layers: [], center: new THREE.Vector3(3, 2, 0.5), span: 10 }
  },
  windmill() {
    const scene = baseScene(), anim = [], hy = 9
    for (let y = 0; y < hy; y++) plain(scene, 'b:stone', 0, y, 0)
    const wb = state(scene, 'create:windmill_bearing', { facing: 'north' }, 0, hy, 0)
    const spin = (t) => -t * 0.35
    const top = facingMX('north')
    part(wb, 'm:create:block/bearing/top_wooden', top, anim, (t) => mx().c().rz(spin(t)).u().mul(top.m))
    shaft(scene, 'z', 0, hy, 1, anim)
    gearbox(scene, 0, hy, 2, anim)
    for (let y2 = hy - 1; y2 >= 1; y2--) shaft(scene, 'y', 0, y2, 2, anim)
    gearbox(scene, 0, 0, 2, anim)
    shaft(scene, 'x', 1, 0, 2, anim); shaft(scene, 'x', 2, 0, 2, anim)
    tag(scene, '4,096 SU @ 8 RPM', 2.6, 1.3, 2, 'green')
    const rotor = new THREE.Group(); rotor.position.set(0, hy, -1); scene.add(rotor)
    const hub = KIT && KIT.get('b:oak_log'); if (hub) { hub.rotation.x = PI / 2; rotor.add(hub) }
    const all = []
    for (let dx = 0; dx <= 1; dx++) for (let dy = 1; dy <= 8; dy++) { let p = [dx, dy]; for (let r = 0; r < 4; r++) { all.push(p); p = [p[1], -p[0]] } }
    all.forEach((c) => { const sl = KIT && KIT.get('create:white_sail'); if (sl) { sl.rotation.x = PI / 2; sl.position.set(c[0], c[1], 0); rotor.add(sl) } })
    anim.push((t) => { rotor.rotation.z = spin(t) })
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

/* ---------------- animated textures (saw blade, magma, …) ---------------- */
function animateTextures(t) {
  if (!KIT) return
  for (const [p, a] of Object.entries(KIT.anims())) {
    const tex = KIT.texCache.get(p)
    if (!tex) continue
    const seq = a.frames || null, len = seq ? seq.length : a.n
    const k = Math.floor(t * 20 / (a.ft || 1)) % len
    tex.offset.y = -(seq ? seq[k] : k) / a.n
  }
  for (const k of ['rt:minecraft/block/water_still', 'rt:minecraft/block/lava_still']) {
    const tex = MAT[k]; if (!tex) continue
    const n = tex.userData.frames, f = Math.floor(t * 10) % n
    tex.offset.y = 1 - (f + 1) / n
  }
}

/* ---------------- viewer ---------------- */
function base() { const u = new URL('.', location.href); return u.pathname.endsWith('/') ? u.pathname : u.pathname + '/' }
const PRELOAD = ['b:burner_lit', 'b:large_water_wheel']
export function createViewer(host) {
  const V = { scenes: {}, current: null, visible: true, last: performance.now(), clock: 0, dead: false }
  // one WebGL renderer for the whole site, moved between pages, so textures are uploaded once
  if (!RENDERER) {
    try { RENDERER = new THREE.WebGLRenderer({ antialias: true, alpha: true }) } catch (e) { V.dead = true; return V }
    RENDERER.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    RENDERER.setClearColor(0x000000, 0)
  }
  const renderer = RENDERER
  host.insertBefore(renderer.domElement, host.firstChild)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true; controls.dampingFactor = 0.12
  controls.maxPolarAngle = PI * 0.495; controls.minDistance = 3; controls.maxDistance = 90
  function renderOnce() { if (V.current) { controls.update(); renderer.render(V.current.scene, camera) } }
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); renderOnce() }
  const ro = new ResizeObserver(resize); ro.observe(host)
  let io = null
  if ('IntersectionObserver' in window) { io = new IntersectionObserver((es) => { V.visible = es[0].isIntersecting }); io.observe(host) }
  function frameScene(sc) {
    const d = (sc.span * 0.82 + 3) * Math.min(2.6, Math.max(1, 1.5 / (camera.aspect || 2)))
    camera.position.set(sc.center.x + d * 0.55, sc.center.y + d * 0.5, sc.center.z + d * 0.8)
    controls.target.copy(sc.center); controls.update()
  }
  V.show = async (key, grid, load) => {
    if (!KIT_READY) {
      KIT_READY = (async () => {
        try {
          const k = createModelKit(base(), { onTexture: () => renderOnce() })
          const all = Object.keys(await k.load()).filter((x) => !x.startsWith('__'))
          await k.preload(all.filter((x) => x.startsWith('m:') || PRELOAD.includes(x)))
          await k.loadAllTextures()
          KIT = k
        } catch (e) { console.warn('3D models failed to load', e); KIT = null }
      })()
    }
    await KIT_READY
    const sig = key + (grid ? '|' + grid.layers.map((l) => l.rows.join('/')).join('#') : '')
    const ck = sig + (load ? '|' + JSON.stringify(load) : '')
    if (!V.scenes[ck]) V.scenes[ck] = grid ? buildTokenScene(grid, load) : (SCENES[key] ? SCENES[key]() : null)
    const sc = V.scenes[ck]; if (!sc) return
    const changed = V.current !== sc; V.current = sc
    if (changed && V.sig !== sig) frameScene(sc)
    V.sig = sig
    // pose every moving part once, so a still frame (reduced motion) is right too
    sc.anim.forEach((f) => f(0.6, 0)); animateTextures(0)
    resize(); renderOnce()
  }
  V.setLayer = (maxY) => { if (!V.current) return; V.current.layers.forEach((g) => { g.visible = maxY == null || g.userData.y <= maxY }); renderOnce() }
  // debug/inspection hook: look at a point from a direction (used by the site's screenshot checks)
  V.look = (tx, ty, tz, px, py, pz) => { controls.target.set(tx, ty, tz); camera.position.set(px, py, pz); controls.update(); renderOnce() }
  if (typeof window !== 'undefined') window.__dcViewer = V
  V.reset = () => { if (V.current) { frameScene(V.current); renderOnce() } }
  controls.addEventListener('change', () => { if (reduceMotion) renderOnce() })
  let raf = 0
  function loop(now) {
    raf = requestAnimationFrame(loop)
    const dt = Math.min(0.05, (now - V.last) / 1000); V.last = now
    if (!V.visible || document.hidden || !V.current) return
    if (!reduceMotion && !V.paused) { V.clock += dt; V.current.anim.forEach((f) => f(V.clock, dt)); animateTextures(V.clock) }
    controls.update(); renderer.render(V.current.scene, camera)
  }
  raf = requestAnimationFrame(loop)
  V.dispose = () => { cancelAnimationFrame(raf); ro.disconnect(); if (io) io.disconnect(); controls.dispose(); if (renderer.domElement.parentNode === host) renderer.domElement.remove() }
  return V
}
