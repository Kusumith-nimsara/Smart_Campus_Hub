import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use project-local .env files in the frontend directory.
  // Previously this was set to the repository root ('..') which
  // prevented Vite from reading `frontend/.env` and left
  // `import.meta.env.VITE_GOOGLE_CLIENT_ID` empty at runtime.
  envDir: '.',
  plugins: [react()],
  // Fix the dev server port so the JavaScript origin stays stable
  // during development. If you prefer a different port, update
  // this value and add the corresponding origin in Google Cloud
  // Console (APIs & Services → Credentials → OAuth 2.0 Client IDs).
 
  server: {
  host: 'localhost',
  port: 5173,
  strictPort: true
}
})
