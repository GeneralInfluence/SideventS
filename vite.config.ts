import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
    proxy: process.env.USE_LOCAL_API === 'true'
      ? { '/api': 'http://localhost:3001' }
      : undefined
  },
})