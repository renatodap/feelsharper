import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  retries: 1,
  use: { headless: true, baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
