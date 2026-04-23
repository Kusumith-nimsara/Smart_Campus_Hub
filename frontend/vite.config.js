import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Read .env from the repository root so that shared variables like
  // VITE_GOOGLE_CLIENT_ID and VITE_API_BASE_URL are available at runtime.
  envDir: '..',
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
