import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Extract base target URL strictly from .env (single source of truth)
  const rawTarget = (
    env.VITE_API_BASE_URL ||
    env.VITE_API_URL ||
    env.VITE_BACKEND_URL ||
    ''
  ).trim()

  // Clean trailing /api and slashes for proxy target
  const target = rawTarget.replace(/\/api\/?$/, '').replace(/\/+$/, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/hubs': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      }
    }
  }
})
