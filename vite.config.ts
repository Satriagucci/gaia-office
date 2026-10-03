import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  server: {
    port: 3334,
    proxy: {
      '/ws': {
        target: 'ws://localhost:8788',
        ws: true,
      },
      '/event': {
        target: 'http://localhost:8788',
      },
      '/chat': {
        target: 'http://localhost:8788',
      },
      '/roster': {
        target: 'http://localhost:8788',
      },
    },
  },
})
