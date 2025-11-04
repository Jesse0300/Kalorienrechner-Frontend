import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 🔥 Proxy für dein Spring-Boot-Backend
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // ← dein Spring Boot läuft hier
        changeOrigin: true,
      },
    },
  },
})
