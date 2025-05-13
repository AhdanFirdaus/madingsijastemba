import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true, // atau host: '0.0.0.0'
    port: 5173,
    allowedHosts: [
      '.ngrok-free.app', // ⬅️ izinkan semua subdomain *.ngrok-free.app
    ]
  }
})
