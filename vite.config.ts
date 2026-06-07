import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served from https://kevinrutledge.github.io/ffxiv-chocobo-racing-calculator/ on Pages.
  base: '/ffxiv-chocobo-racing-calculator/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    environment: 'node',
  },
})
