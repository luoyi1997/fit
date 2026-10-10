import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages 子路径部署：仓库 12ASIR/fitness-app 将发布到 https://12ASIR.github.io/fitness-app/
  base: '/fitness-app/',
  plugins: [react(), tailwindcss()],
})

