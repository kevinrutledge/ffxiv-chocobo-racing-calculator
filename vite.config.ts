import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served from https://kevinrutledge.github.io/ffxiv-chocobo-racing-calculator/ on Pages.
  base: '/ffxiv-chocobo-racing-calculator/',
  plugins: [react(), tailwindcss()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          include: ['test/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          include: ['test/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./test/setup/jsdom.ts'],
        },
      },
    ],
  },
})
