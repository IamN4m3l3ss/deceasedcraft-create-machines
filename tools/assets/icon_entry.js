// Bundled by render_icons.mjs and run in headless Chromium: draws one icon per model.
import * as THREE from 'three'
import { createModelKit, applyGui } from '../../src/three/mcmodel.js'

const SIZE = 96
const kit = createModelKit('/', { flatShade: true })
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
renderer.setSize(SIZE, SIZE)
renderer.setClearColor(0x000000, 0)
document.body.appendChild(renderer.domElement)
const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10, 10)
camera.position.set(0, 0, 5)

function waitTextures() {
  return new Promise((res) => {
    const check = () => { if ([...kit.texCache.values()].every((t) => t.image && t.image.complete)) res(); else setTimeout(check, 30) }
    check()
  })
}
async function flatIcon(model) {
  const c = document.createElement('canvas'); c.width = c.height = SIZE
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false
  for (const p of model.flat) {
    const img = new Image(); img.src = '/mc/' + p; await img.decode()
    g.drawImage(img, 0, 0, img.width, img.width, 0, 0, SIZE, SIZE)
  }
  return c.toDataURL('image/png')
}
window.renderIcon = async (key) => {
  const models = await kit.load()
  const m = models[key]
  if (!m) return null
  if (m.flat) return flatIcon(m)
  const grp = await kit.build(key)
  const scene = new THREE.Scene()
  scene.add(applyGui(grp, m.gui))
  await waitTextures()
  await new Promise((r) => setTimeout(r, 20))
  renderer.render(scene, camera)
  return renderer.domElement.toDataURL('image/png')
}
window.iconKeys = async () => Object.keys(await kit.load())
