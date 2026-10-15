import { reactive } from 'vue'

export const store = reactive({
  /** item id shown in the side drawer */
  drawer: null as string | null,
  /** real textures available under public/icons (from icons/manifest.json) */
  icons: new Set<string>(),
  iconsLoaded: false,
  navOpen: false,
})

export function openItem(id: string) { store.drawer = id }
export function closeItem() { store.drawer = null }

export async function loadIconManifest() {
  try {
    const r = await fetch('icons/manifest.json', { cache: 'no-cache' })
    if (r.ok) {
      const list: string[] = await r.json()
      store.icons = new Set(list)
    }
  } catch { /* no real icons: pixel icons are used */ }
  store.iconsLoaded = true
}

export function loadLocal<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback } catch { return fallback }
}
export function saveLocal(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ }
}
