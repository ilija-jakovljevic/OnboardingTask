import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': env.POLL_API_HOST ?? 'http://localhost:8080',
      },
      port: env.PORT,
      host: '0.0.0.0'
    },
  }
})
