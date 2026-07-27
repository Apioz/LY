import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 关键：仓库名LY，base配置 '/LY/'
  base: '/LY/',
  server: {
    host: true,
    port: 5173,
  },
})