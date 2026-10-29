import react from '@vitejs/plugin-react'
import type { ProxyOptions } from 'vite'
import { defineConfig } from 'vitest/config'

// Mirrors the rewrite in vercel.json: only this exact path is proxied to CNB
const CNB_DAILY_RATES_SOURCE = '/api/cnb/daily.txt'
const CNB_DAILY_RATES_TARGET =
  '/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt'

const cnbProxy: Record<string, ProxyOptions> = {
  [CNB_DAILY_RATES_SOURCE]: {
    target: 'https://www.cnb.cz',
    changeOrigin: true,
    rewrite: () => CNB_DAILY_RATES_TARGET,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: cnbProxy },
  preview: { proxy: cnbProxy },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost' },
    },
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
})
