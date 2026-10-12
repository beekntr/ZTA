import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      // The app calls /api on its own origin; in dev, forward that to the FastAPI backend.
      proxy: { '/api': env.DEV_API_TARGET || 'http://192.168.1.6:8000' },
    },
    preview: {
      port: 3000,
    },
  }
})
