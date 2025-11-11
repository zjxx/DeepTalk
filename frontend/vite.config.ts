import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslint from 'vite-plugin-eslint'
// import VueDevTools from 'vite-plugin-vue-devtools'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslint(),
    // 需要时在 .env.local 里设置 VITE_ENABLE_DEVTOOLS=true 并取消下行注释引入
    // VueDevTools(),
    basicSsl(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5172,
    https:{},
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
})
