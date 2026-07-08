import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Builds into ../login (repo-root /login/) so GitHub Pages can serve it
// as plain static files alongside the rest of the site — no Actions
// build step. `base: './'` keeps every asset URL relative so it works
// whether served at /login/, at a project subpath, or opened directly.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: fileURLToPath(new URL('../login', import.meta.url)),
    emptyOutDir: true,
  },
})
