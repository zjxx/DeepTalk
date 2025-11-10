import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslint from 'vite-plugin-eslint'
import basicSsl from '@vitejs/plugin-basic-ssl'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    eslint(),
    // 按需启用 DevTools（隐藏右下角悬浮工具按钮）
    ...(process.env.VITE_ENABLE_DEVTOOLS === 'true' ? [VueDevTools()] : []),
    basicSsl(),
  ],
  server: {
    https: true,
  },
})