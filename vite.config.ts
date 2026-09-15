import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built site works from any GitHub Pages project path
  // (https://<user>.github.io/<repo>/) without hardcoding the repo name.
  base: './',
  plugins: [react()],
})
