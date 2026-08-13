import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** GitHub Pages bases — set only in CI deploy workflows */
function pagesBase() {
  if (process.env.GITHUB_PAGES !== 'true') return '/'
  if (process.env.GITHUB_PAGES_PATH === 'preview') return '/onboarding-nasooh/preview/'
  return '/onboarding-nasooh/'
}

export default defineConfig({
  base: pagesBase(),
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
