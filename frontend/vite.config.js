import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  envDir: '..',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,  // Force port 5173 - fail if unavailable
    host: 'localhost',
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'http',
    },
  },
})
