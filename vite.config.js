import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
// Production: serve the built app so that /assets/*.js requests return real JS files with
// Content-Type: application/javascript. If your server returns index.html for /assets/*,
// the browser will show "Expected a JavaScript module but got text/html" and the app may crash.
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  publicDir: 'public'
})

