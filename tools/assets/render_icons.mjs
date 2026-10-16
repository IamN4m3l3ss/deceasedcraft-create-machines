// Renders public/icons/<namespace>/<item>.png from public/mc/models.json.
// Run: node tools/assets/render_icons.mjs   (needs playwright + chromium; see tools/assets/README.md)
import { build } from 'esbuild'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const PUB = path.join(ROOT, 'public')
const OUT = path.join(PUB, 'icons')
const js = (await build({ entryPoints: [path.join(ROOT, 'tools/assets/icon_entry.js')], bundle: true, write: false, format: 'iife' })).outputFiles[0].text
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0])
  if (u === '/' || u === '/index.html') { res.setHeader('content-type', 'text/html'); return res.end('<!doctype html><body style="margin:0;background:transparent"><script>' + js.replace(/<\/script>/g, '<\\/script>') + '</script>') }
  const f = path.join(PUB, u)
  if (!f.startsWith(PUB) || !fs.existsSync(f)) { res.statusCode = 404; return res.end() }
  res.setHeader('content-type', f.endsWith('.png') ? 'image/png' : f.endsWith('.json') ? 'application/json' : 'text/plain')
  fs.createReadStream(f).pipe(res)
}).listen(0)
const port = srv.address().port
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] })
const p = await b.newPage()
p.on('pageerror', (e) => console.log('PAGEERROR', e.message))
await p.goto(`http://localhost:${port}/`)
await p.waitForFunction(() => !!window.renderIcon)
const keys = (await p.evaluate(() => window.iconKeys())).filter((k) => !k.startsWith('b:'))
const only = process.argv[2] ? process.argv[2].split(',') : null
fs.rmSync(OUT, { recursive: true, force: true })
const done = []
for (const k of keys) {
  if (only && !only.includes(k)) continue
  const url = await p.evaluate((k) => window.renderIcon(k), k)
  if (!url) continue
  const rel = k.replace(':', '/')
  const dst = path.join(OUT, rel + '.png')
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.writeFileSync(dst, Buffer.from(url.split(',')[1], 'base64'))
  done.push(rel)
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(done))
console.log(done.length, 'icons written to public/icons')
await b.close(); srv.close()
