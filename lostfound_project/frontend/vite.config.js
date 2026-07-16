import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API and WebSocket calls to the local Spring Boot backend
      // when running the frontend separately with `npm run dev`.
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/chat-ws': {
        target: 'ws://localhost:8081',
        ws: true,
      },
    },
  },
})
