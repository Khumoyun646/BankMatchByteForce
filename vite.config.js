import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Запросы /api идут на Node-сервер (npm run server)
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
