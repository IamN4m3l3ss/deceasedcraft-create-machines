import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Built files go to /docs so GitHub Pages can serve them from the main branch.
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: { outDir: 'docs', emptyOutDir: true, chunkSizeWarningLimit: 900 },
})
