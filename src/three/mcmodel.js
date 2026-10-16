// Builds three.js meshes from the resolved Minecraft models in public/mc/models.json
// (cuboid JSON models, Forge OBJ models and flat item textures). Used by the 3D viewer and by
// tools/assets/render_icons.mjs to draw the item icons.
import * as THREE from 'three'

const DEG = Math.PI / 180
// per-face brightness, like Minecraft's block shading
const SHADE = { up: 1, down: 0.5, north: 0.8, south: 0.8, east: 0.6, west: 0.6 }

export function createModelKit(base, opts = {}) {
  const loader = new THREE.TextureLoader()
  const texCache = new Map(), matCache = new Map(), objCache = new Map()
  let models = null
  const flatShade = !!opts.flatShade // icons: Minecraft-style baked face shading, no lights

  async function load() {
    if (models) return models
    const r = await fetch(base + 'mc/models.json')
    models = await r.json()
    return models
  }
  function texture(p) {
    let t = texCache.get(p)
    if (t) return t
    t = loader.load(base + 'mc/' + p, (tx) => { tx.needsUpdate = true; opts.onTexture && opts.onTexture() })
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false
    t.colorSpace = THREE.SRGBColorSpace
    texCache.set(p, t)
    return t
  }
  function material(p) {
    let m = matCache.get(p)
    if (m) return m
    const o = { map: texture(p), alphaTest: 0.1, side: THREE.DoubleSide, vertexColors: flatShade }
    m = flatShade ? new THREE.MeshBasicMaterial(o) : new THREE.MeshLambertMaterial(o)
    matCache.set(p, m)
    return m
  }

  // ---- cuboid models ----
  function faceCorners(d, x1, y1, z1, x2, y2, z2) {
    switch (d) {
      case 'north': return [[x2, y2, z1], [x1, y2, z1], [x1, y1, z1], [x2, y1, z1]]
      case 'south': return [[x1, y2, z2], [x2, y2, z2], [x2, y1, z2], [x1, y1, z2]]
      case 'west': return [[x1, y2, z1], [x1, y2, z2], [x1, y1, z2], [x1, y1, z1]]
      case 'east': return [[x2, y2, z2], [x2, y2, z1], [x2, y1, z1], [x2, y1, z2]]
      case 'up': return [[x1, y2, z1], [x2, y2, z1], [x2, y2, z2], [x1, y2, z2]]
      case 'down': return [[x1, y1, z2], [x2, y1, z2], [x2, y1, z1], [x1, y1, z1]]
    }
  }
  function defaultUV(d, x1, y1, z1, x2, y2, z2) {
    switch (d) {
      case 'north': return [16 - x2, 16 - y2, 16 - x1, 16 - y1]
      case 'south': return [x1, 16 - y2, x2, 16 - y1]
      case 'west': return [z1, 16 - y2, z2, 16 - y1]
      case 'east': return [16 - z2, 16 - y2, 16 - z1, 16 - y1]
      case 'up': return [x1, z1, x2, z2]
      case 'down': return [x1, 16 - z2, x2, 16 - z1]
    }
  }
  function elementsGroup(model) {
    const byTex = new Map() // tex -> {pos:[], uv:[], col:[]}
    for (const e of model.el) {
      const [x1, y1, z1] = e.f, [x2, y2, z2] = e.t
      let mtx = null
      if (e.rot) {
        const ax = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) }[e.rot.ax]
        const o = new THREE.Vector3(...e.rot.o)
        mtx = new THREE.Matrix4().makeTranslation(o.x, o.y, o.z)
        mtx.multiply(new THREE.Matrix4().makeRotationAxis(ax, e.rot.a * DEG))
        if (e.rot.rs) {
          const k = 1 / Math.cos(Math.abs(e.rot.a) * DEG)
          mtx.multiply(new THREE.Matrix4().makeScale(e.rot.ax === 'x' ? 1 : k, e.rot.ax === 'y' ? 1 : k, e.rot.ax === 'z' ? 1 : k))
        }
        mtx.multiply(new THREE.Matrix4().makeTranslation(-o.x, -o.y, -o.z))
      }
      for (const [d, f] of Object.entries(e.faces)) {
        const c = faceCorners(d, x1, y1, z1, x2, y2, z2)
        if (!c) continue
        const [u1, v1, u2, v2] = f.uv || defaultUV(d, x1, y1, z1, x2, y2, z2)
        let uvs = [[u1, v1], [u2, v1], [u2, v2], [u1, v2]]
        const k = ((f.r || 0) / 90) & 3
        if (k) uvs = uvs.map((_, i) => uvs[(i - k + 4) % 4])
        const a = f.a || 1
        let b = byTex.get(f.t)
        if (!b) { b = { pos: [], uv: [], col: [] }; byTex.set(f.t, b) }
        const pts = c.map((p) => { const v = new THREE.Vector3(...p); if (mtx) v.applyMatrix4(mtx); return v })
        const s = e.ns ? 1 : SHADE[d]
        for (const i of [0, 3, 2, 0, 2, 1]) {
          const v = pts[i]
          b.pos.push(v.x / 16 - 0.5, v.y / 16 - 0.5, v.z / 16 - 0.5)
          b.uv.push(uvs[i][0] / 16, 1 - (uvs[i][1] / 16) * a)
          b.col.push(s, s, s)
        }
      }
    }
    const g = new THREE.Group()
    for (const [t, b] of byTex) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3))
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2))
      if (flatShade) geo.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3))
      geo.computeVertexNormals()
      g.add(new THREE.Mesh(geo, material(t)))
    }
    return g
  }

  // ---- Forge OBJ models (block units, 0..1) ----
  async function objGroup(model) {
    let text = objCache.get(model.obj)
    if (!text) { text = await (await fetch(base + 'mc/' + model.obj)).text(); objCache.set(model.obj, text) }
    const V = [], VT = []
    const byMat = new Map()
    let cur = null
    for (const line of text.split('\n')) {
      const p = line.trim().split(/\s+/)
      if (p[0] === 'v') V.push([+p[1], +p[2], +p[3]])
      else if (p[0] === 'vt') VT.push([+p[1], +p[2]])
      else if (p[0] === 'usemtl') cur = p[1]
      else if (p[0] === 'f') {
        const idx = p.slice(1).map((s) => s.split('/').map((n) => parseInt(n, 10)))
        const m = model.mats[cur] || Object.values(model.mats)[0]
        if (!m) continue
        let b = byMat.get(m)
        if (!b) { b = { pos: [], uv: [], col: [] }; byMat.set(m, b) }
        const a = m.includes('|') ? +m.split('|')[1] : 1
        for (let i = 1; i < idx.length - 1; i++) {
          for (const k of [0, i, i + 1]) {
            const v = V[idx[k][0] - 1], t = VT[(idx[k][1] || 1) - 1] || [0, 0]
            b.pos.push(v[0] - 0.5, v[1] - 0.5, v[2] - 0.5)
            const tv = model.flipV ? 1 - t[1] : t[1]
            b.uv.push(t[0], 1 - (1 - tv) * a)
          }
        }
      }
    }
    const g = new THREE.Group()
    for (const [m, b] of byMat) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3))
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2))
      geo.computeVertexNormals()
      if (flatShade) {
        // shade by normal direction, like the cuboid models
        const n = geo.getAttribute('normal'), col = []
        for (let i = 0; i < n.count; i++) {
          const nx = Math.abs(n.getX(i)), ny = n.getY(i), nz = Math.abs(n.getZ(i))
          const s = ny > 0.7 ? 1 : ny < -0.7 ? 0.5 : nz > nx ? 0.8 : 0.6
          col.push(s, s, s)
        }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
      }
      g.add(new THREE.Mesh(geo, material(m.split('|')[0])))
    }
    return g
  }

  // ---- flat item sprites (layers stacked) ----
  function flatGroup(model) {
    const g = new THREE.Group()
    model.flat.forEach((p, i) => {
      const geo = new THREE.PlaneGeometry(1, 1)
      const t = loader.load(base + 'mc/' + p, (tx) => {
        const im = tx.image
        if (im && im.height > im.width) { // animated strip: show the first frame
          const a = im.width / im.height, uv = geo.getAttribute('uv')
          for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (1 - uv.getY(k)) * a)
          uv.needsUpdate = true
        }
        opts.onTexture && opts.onTexture()
      })
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace
      const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.z = i * 0.001
      mesh.userData.crop = true
      g.add(mesh)
    })
    return g
  }

  /** a THREE.Group for the model key, centred on the origin, 1 unit = 1 block */
  async function build(key) {
    const ms = await load()
    const m = ms[key]
    if (!m) return null
    if (m.flat) return flatGroup(m)
    if (m.obj) return objGroup(m)
    return elementsGroup(m)
  }
  const built = new Map()
  /** preload models (fetches OBJ files); afterwards get() works synchronously */
  async function preload(keys) {
    await load()
    for (const k of keys) if (models[k] && !built.has(k)) { const g = await build(k); if (g) built.set(k, g) }
  }
  /** a clone of a preloaded (or cuboid/flat) model, sharing geometry and materials; null if unknown */
  function get(key) {
    if (!models || !models[key]) return null
    let g = built.get(key)
    if (!g) {
      const m = models[key]
      if (m.obj) return null
      g = m.flat ? flatGroup(m) : elementsGroup(m)
      built.set(key, g)
    }
    return g.clone()
  }
  function has(key) { return !!(models && models[key]) }
  function info(key) { return models && models[key] }
  function allLoaded() { return [...texCache.values()].every((t) => t.image && t.image.complete !== false) }
  return { load, build, preload, get, has, info, texture, material, allLoaded, texCache }
}

/** apply a model's display.gui transform (rotation, translation in 1/16 block, scale) to a group */
export function applyGui(group, gui) {
  const r = gui.rotation || [0, 0, 0], t = gui.translation || [0, 0, 0], s = gui.scale || [1, 1, 1]
  const outer = new THREE.Group()
  group.scale.set(s[0], s[1], s[2])
  group.rotation.set(r[0] * DEG, r[1] * DEG, r[2] * DEG, 'XYZ')
  outer.add(group)
  outer.position.set(t[0] / 16, t[1] / 16, t[2] / 16)
  return outer
}
