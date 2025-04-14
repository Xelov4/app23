import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  /* Temps maximum d'exécution pour chaque test en millisecondes */
  timeout: 30 * 1000,
  /* Nombre d'échecs autorisés avant d'arrêter */
  maxFailures: 2,
  /* Exécuter les tests en parallèle */
  fullyParallel: true,
  /* Ne pas capturer les traces, snapshots, vidéos par défaut */
  use: {
    /* Base URL pour les tests */
    baseURL: 'http://localhost:3000',
    /* Prendre une capture d'écran en cas d'échec */
    screenshot: 'only-on-failure',
    /* Collecter les traces en cas d'échec */
    trace: 'on-first-retry',
  },
  /* Reporter à utiliser */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  /* Projets pour les différents navigateurs */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Test sur les appareils mobiles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  /* Options de serveur de développement */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 