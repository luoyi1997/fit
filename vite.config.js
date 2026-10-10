import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages 子路径部署：仓库 luoyi1997/fit 将发布到 https://luoyi1997.github.io/fit/
  base: '/fit/',
  plugins: [react(), tailwindcss()],
})

