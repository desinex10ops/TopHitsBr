import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// FORCE RELOAD: 2026-02-11 - PORT CHANGE
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true, // Exposes IP
    port: 5174
  }
})
