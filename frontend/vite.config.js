import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use the frontend-local .env file so VITE_* values are loaded correctly
  // for this app at runtime.
  plugins: [react()],
  // Fix the dev server port so the JavaScript origin stays stable
  // during development. If you prefer a different port, update
  // this value and add the corresponding origin in Google Cloud
  // Console (APIs & Services → Credentials → OAuth 2.0 Client IDs).
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'http',
    },
  },
})
