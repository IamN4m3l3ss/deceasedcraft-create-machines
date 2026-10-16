// Hand-drawn 16x16 stand-in icons. Every item gets a shape + a colour; the drawers below
// paint simple pixel art so items are recognisable without shipping the mods' textures.
export type Shape =
  | 'ingot' | 'nugget' | 'plate' | 'rod' | 'wire' | 'coil' | 'gear' | 'biggear' | 'block' | 'casing'
  | 'machine' | 'dust' | 'gem' | 'bucket' | 'slab' | 'planks' | 'log' | 'stick' | 'wool' | 'sail'
  | 'chest' | 'hopper' | 'pipe' | 'tank' | 'engine' | 'glue' | 'chip' | 'tube' | 'spring' | 'box'
  | 'mob' | 'funnel' | 'hand' | 'filter' | 'belt' | 'wheel' | 'bigwheel' | 'arm' | 'burner' | 'saw'
  | 'press' | 'pump' | 'kelp' | 'glass' | 'clock' | 'chain' | 'torch' | 'rodblock' | 'reactor' | 'piston' | 'scanner' | 'stone' | 'shell' | 'paper'

export interface IconSpec { shape: Shape; c: string; c2?: string }

type RGB = [number, number, number]
function hex(h: string): RGB { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
function shade([r, g, b]: RGB, f: number): string {
  const k = (v: number) => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))))
  return `rgb(${k(r)},${k(g)},${k(b)})`
}

const cache = new Map<string, string>()

/** the 16x16 canvas for an icon (used to extrude stand-in items in the 3D view) */
export function iconCanvas(spec: IconSpec): HTMLCanvasElement {
  iconUrl(spec)
  return canvasCache.get(spec.shape + spec.c + (spec.c2 || ''))!
}
const canvasCache = new Map<string, HTMLCanvasElement>()

export function iconUrl(spec: IconSpec): string {
  const key = spec.shape + spec.c + (spec.c2 || '')
  const hit = cache.get(key); if (hit) return hit
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16
  canvasCache.set(key, cv)
  const g = cv.getContext('2d')!
  const base = hex(spec.c), alt = hex(spec.c2 || spec.c)
  const P = {
    m: shade(base, 0), d: shade(base, -0.35), dd: shade(base, -0.6), l: shade(base, 0.3), ll: shade(base, 0.55),
    a: shade(alt, 0), ad: shade(alt, -0.35), al: shade(alt, 0.3), o: 'rgb(28,30,34)', w: 'rgb(235,235,230)',
  }
  const px = (x: number, y: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, 1, 1) }
  const rect = (x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h) }
  const outline = (x: number, y: number, w: number, h: number, c = P.o) => { rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y, 1, h, c); rect(x + w - 1, y, 1, h, c) }
  const disc = (cx: number, cy: number, r: number, fill: string, edge?: string) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
      if (d <= r) px(x, y, edge && d > r - 1 ? edge : fill)
    }
  }
  const cube = (top: string, left: string, right: string) => {
    // simple isometric block
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const cx = x - 7.5
      if (y < 5 + (Math.abs(cx) > 7 ? 9 : 0) && y >= 1 + Math.abs(cx) * 0.5 && y <= 8 - Math.abs(cx) * 0.5) px(x, y, top)
      else if (y >= 4 + Math.abs(cx) * 0.5 - (cx < 0 ? 0 : 0) && y < 15 - Math.abs(cx) * 0.5 + 3.6 && y <= 15) {
        if (y > 4 - 0.5 + Math.abs(cx) * 0.5 && y >= 8 - Math.abs(cx) * 0.5) px(x, y, cx < 0 ? left : right)
      }
    }
  }
  switch (spec.shape) {
    case 'ingot':
      for (let i = 0; i < 6; i++) rect(2 + i, 10 - i, 10, 1, i < 2 ? P.d : P.m)
      rect(3, 9, 9, 1, P.l); rect(5, 7, 8, 1, P.ll); rect(2, 10, 10, 2, P.d); rect(2, 12, 10, 1, P.dd); break
    case 'nugget':
      disc(8, 9, 4, P.m, P.d); px(6, 7, P.ll); px(7, 7, P.l); break
    case 'plate':
      rect(2, 4, 12, 9, P.m); rect(2, 4, 12, 1, P.ll); rect(2, 12, 12, 1, P.d); rect(13, 4, 1, 9, P.d); px(4, 6, P.l); px(5, 6, P.l); break
    case 'rod':
      for (let i = 0; i < 11; i++) { px(3 + i, 13 - i, P.m); px(4 + i, 13 - i, P.d); px(3 + i, 12 - i, P.l) } break
    case 'stick':
      for (let i = 0; i < 11; i++) { px(3 + i, 13 - i, '#8a5a2b'); px(4 + i, 13 - i, '#5e3b1a') } break
    case 'wire':
      for (let i = 0; i < 12; i++) { const y = 8 + Math.round(Math.sin(i * 0.9) * 3); px(2 + i, y, P.m); px(2 + i, y + 1, P.d) } break
    case 'coil':
      rect(3, 3, 10, 10, P.dd); for (let y = 4; y < 12; y += 2) rect(3, y, 10, 1, P.m); rect(6, 2, 4, 12, '#6b4a2a'); rect(6, 2, 4, 1, '#8a6a3a'); break
    case 'gear': case 'biggear': {
      const r = spec.shape === 'gear' ? 5 : 6.5
      disc(8, 8, r, P.m, P.d); for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; rect(Math.round(8 + Math.cos(t) * (r + 0.8)) - 1, Math.round(8 + Math.sin(t) * (r + 0.8)) - 1, 2, 2, P.d) }
      disc(8, 8, 2, '#9aa0a3', '#5b6063'); break }
    case 'block': case 'stone':
      rect(2, 2, 12, 12, P.m); rect(2, 2, 12, 2, P.l); rect(2, 12, 12, 2, P.d); rect(12, 2, 2, 12, P.d); outline(2, 2, 12, 12, P.dd)
      if (spec.shape === 'stone') { px(5, 6, P.d); px(9, 9, P.d); px(7, 11, P.l); px(10, 5, P.l) } break
    case 'casing':
      rect(2, 2, 12, 12, P.m); outline(2, 2, 12, 12, P.a); rect(3, 3, 10, 1, P.al); rect(3, 3, 1, 10, P.al); rect(12, 3, 1, 10, P.ad); rect(3, 12, 10, 1, P.ad)
      for (const [x, y] of [[4, 4], [11, 4], [4, 11], [11, 11]]) px(x, y, P.ll); break
    case 'machine':
      rect(2, 4, 12, 10, P.m); outline(2, 4, 12, 10, P.dd); rect(2, 2, 12, 3, P.a); outline(2, 2, 12, 3, P.dd); rect(6, 7, 4, 4, P.d); px(7, 8, P.ll); break
    case 'dust':
      for (let y = 9; y < 14; y++) rect(8 - (y - 8), y, (y - 8) * 2, 1, y % 2 ? P.m : P.l); px(7, 8, P.l); break
    case 'gem':
      for (let y = 3; y < 13; y++) { const w = y < 7 ? (y - 2) * 2 : (13 - y) * 2; rect(8 - w / 2, y, w, 1, y < 7 ? P.l : P.m) } px(7, 5, P.ll); break
    case 'bucket':
      rect(4, 5, 8, 8, '#a9adb0'); rect(5, 5, 6, 3, P.m); rect(3, 4, 10, 1, '#d0d4d6'); rect(4, 12, 8, 1, '#6f7376'); break
    case 'slab':
      rect(2, 8, 12, 6, P.m); rect(2, 8, 12, 1, P.l); rect(2, 13, 12, 1, P.d); outline(2, 8, 12, 6, P.dd); break
    case 'planks':
      rect(2, 2, 12, 12, P.m); for (let y = 5; y < 14; y += 4) rect(2, y, 12, 1, P.d); outline(2, 2, 12, 12, P.dd); break
    case 'log':
      rect(3, 2, 10, 12, '#6b4a2a'); for (let x = 4; x < 13; x += 3) rect(x, 2, 1, 12, '#4e3520'); rect(3, 2, 10, 2, P.m); px(7, 2, P.d); break
    case 'wool':
      rect(2, 2, 12, 12, P.m); for (let i = 0; i < 12; i++) px(2 + ((i * 5) % 12), 2 + ((i * 7) % 12), P.d); outline(2, 2, 12, 12, P.d); break
    case 'sail':
      rect(4, 2, 2, 12, '#8a5a2b'); rect(6, 3, 7, 9, P.m); for (let x = 7; x < 13; x += 2) rect(x, 3, 1, 9, P.d); break
    case 'chest':
      rect(2, 4, 12, 10, '#a06a32'); rect(2, 4, 12, 4, '#b47a3c'); rect(2, 8, 12, 1, '#5e3b1a'); rect(7, 7, 2, 3, '#c9cdd0'); outline(2, 4, 12, 10, '#3e2812'); break
    case 'hopper':
      rect(2, 3, 12, 4, '#5d6266'); rect(4, 7, 8, 3, '#4a4f53'); rect(6, 10, 4, 4, '#3b4043'); rect(3, 4, 10, 1, '#2a2d30'); break
    case 'pipe':
      rect(2, 6, 12, 5, P.m); rect(2, 6, 12, 1, P.l); rect(2, 10, 12, 1, P.d); rect(1, 5, 2, 7, P.d); rect(13, 5, 2, 7, P.d); break
    case 'tank':
      rect(3, 2, 10, 12, P.m); outline(3, 2, 10, 12, P.dd); rect(5, 4, 6, 8, '#3b6fa0'); rect(5, 4, 6, 2, '#5d95c6'); break
    case 'engine':
      rect(2, 5, 12, 9, P.m); outline(2, 5, 12, 9, P.dd); rect(4, 2, 3, 4, P.a); rect(9, 2, 3, 4, P.a); rect(4, 8, 8, 3, P.d); break
    case 'glue':
      rect(5, 3, 6, 10, '#d8e6c2'); rect(6, 1, 4, 2, '#9aa0a3'); rect(5, 7, 6, 3, P.m); outline(5, 3, 6, 10, '#5b6b45'); break
    case 'chip':
      rect(3, 3, 10, 10, P.m); outline(3, 3, 10, 10, P.dd); for (let i = 4; i < 13; i += 2) { px(i, 2, '#c9cdd0'); px(i, 13, '#c9cdd0'); px(2, i, '#c9cdd0'); px(13, i, '#c9cdd0') } rect(6, 6, 4, 4, P.a); break
    case 'shell': { // empty brass bullet casing, standing at an angle
      for (let i = 0; i < 9; i++) { const x = 4 + i * 0.6 | 0, y = 12 - i; rect(x, y - 2, 5, 3, i < 2 ? P.d : i > 6 ? P.l : P.m) }
      rect(4, 12, 6, 2, P.dd); rect(9, 3, 4, 2, P.o); rect(10, 2, 2, 1, P.d); break
    }
    case 'paper': { // a sheet with blue print lines
      rect(2, 2, 12, 12, P.m); outline(2, 2, 12, 12, P.d); for (let y = 4; y < 13; y += 2) rect(4, y, 8, 1, P.a); rect(4, 4, 4, 4, P.al); break
    }
    case 'tube':
      rect(5, 2, 6, 12, '#cfe4ec'); outline(5, 2, 6, 12, '#6f8a96'); rect(7, 4, 2, 6, P.m); rect(5, 12, 6, 2, '#6f7376'); break
    case 'spring':
      for (let y = 2; y < 14; y++) px(5 + ((y % 4 < 2) ? y % 4 * 3 : (4 - y % 4) * 3), y, y % 2 ? P.m : P.d); rect(4, 2, 8, 1, P.d); rect(4, 13, 8, 1, P.d); break
    case 'box':
      rect(2, 4, 12, 10, '#b98d58'); rect(2, 4, 12, 3, '#cfa26b'); rect(7, 4, 2, 10, '#8f6a3e'); outline(2, 4, 12, 10, '#6a4c2a'); break
    case 'mob':
      rect(4, 2, 8, 8, '#e8b13a'); rect(5, 4, 2, 2, '#3a2a10'); rect(9, 4, 2, 2, '#3a2a10'); for (let i = 0; i < 4; i++) rect(3 + i * 3, 11, 2, 4, '#f0c94f'); break
    case 'funnel':
      rect(2, 4, 12, 4, P.m); rect(4, 8, 8, 3, P.d); rect(6, 11, 4, 3, P.dd); rect(2, 4, 12, 1, P.l); break
    case 'hand':
      rect(5, 7, 6, 7, P.m); rect(4, 3, 2, 5, P.m); rect(7, 2, 2, 6, P.m); rect(10, 3, 2, 5, P.m); rect(5, 13, 6, 1, P.d); break
    case 'filter':
      rect(2, 5, 12, 6, '#e6e6e0'); for (let x = 3; x < 13; x += 2) rect(x, 5, 1, 6, '#bdbdb5'); rect(1, 5, 1, 6, '#9aa0a3'); rect(14, 5, 1, 6, '#9aa0a3'); break
    case 'belt':
      rect(1, 5, 14, 6, '#3a3f44'); for (let x = 2; x < 14; x += 3) rect(x, 6, 1, 4, '#5c636a'); disc(3, 8, 2.5, '#9aa0a3'); disc(13, 8, 2.5, '#9aa0a3'); break
    case 'wheel': case 'bigwheel':
      disc(8, 8, spec.shape === 'wheel' ? 6 : 7, P.m, P.dd); for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; for (let r = 2; r < 7; r++) px(Math.round(8 + Math.cos(t) * r), Math.round(8 + Math.sin(t) * r), P.d) } disc(8, 8, 1.5, '#9aa0a3'); break
    case 'arm':
      rect(3, 11, 10, 3, P.a); rect(7, 6, 2, 6, P.m); rect(7, 6, 6, 2, P.m); rect(11, 3, 2, 4, P.d); break
    case 'burner':
      rect(3, 3, 10, 11, '#4a4f53'); for (let x = 4; x < 13; x += 2) rect(x, 4, 1, 9, '#2a2d30'); rect(5, 8, 6, 4, spec.c); rect(6, 6, 4, 2, P.l); break
    case 'saw':
      rect(2, 9, 12, 5, P.a); disc(8, 7, 5, '#cfd3d6', '#6f7376'); disc(8, 7, 1.5, '#6f7376'); break
    case 'press':
      rect(2, 2, 12, 7, P.a); outline(2, 2, 12, 7, P.o); rect(4, 9, 8, 3, '#b8bec2'); rect(3, 12, 10, 2, '#8b9195'); break
    case 'pump':
      rect(1, 6, 14, 5, P.m); disc(8, 8, 4.5, '#8a6a3a', '#5e3b1a'); disc(8, 8, 1.5, '#9aa0a3'); break
    case 'kelp':
      for (let y = 2; y < 14; y++) { px(6 + (y % 3 === 0 ? 1 : 0), y, '#3c4a2a'); px(8 + (y % 4 === 0 ? 1 : 0), y, '#55663a') } break
    case 'glass':
      rect(2, 2, 12, 12, 'rgba(200,225,235,0.35)'); outline(2, 2, 12, 12, '#cfe4ec'); px(4, 4, '#ffffff'); px(5, 5, '#ffffff'); break
    case 'clock':
      disc(8, 8, 6, '#e8c44c', '#9a7a1a'); disc(8, 8, 3.5, '#f5f0d8'); rect(8, 5, 1, 3, '#333'); rect(8, 8, 2, 1, '#333'); break
    case 'chain':
      for (let y = 2; y < 14; y += 4) { outline(6, y, 4, 4, '#6f7376') } break
    case 'torch':
      rect(7, 6, 2, 8, '#8a5a2b'); rect(6, 3, 4, 3, spec.c); px(7, 2, '#ffd27a'); break
    case 'rodblock':
      rect(2, 2, 12, 12, P.m); outline(2, 2, 12, 12, P.dd); rect(6, 2, 4, 12, P.a); break
    case 'reactor':
      rect(2, 2, 12, 12, '#3a4048'); outline(2, 2, 12, 12, '#1d2126'); rect(4, 4, 8, 8, P.m); rect(6, 6, 4, 4, P.l); break
    case 'piston':
      rect(2, 2, 12, 4, '#b08a58'); rect(2, 6, 12, 8, '#7d8286'); rect(7, 6, 2, 8, '#5b6063'); outline(2, 2, 12, 12, '#3a3d40'); break
    case 'scanner':
      rect(3, 2, 10, 12, P.m); outline(3, 2, 10, 12, P.dd); disc(8, 7, 3, '#7fd18b', '#3a7a46'); rect(5, 11, 6, 1, P.d); break
    default: cube(P.l, P.m, P.d)
  }
  const url = cv.toDataURL()
  cache.set(key, url)
  return url
}
