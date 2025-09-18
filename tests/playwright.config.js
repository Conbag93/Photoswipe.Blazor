// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Centralized configuration for easy changes
const TEST_CONFIG = {
  port: 5225,
  baseURL: 'http://localhost:5225'
};

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],

  outputDir: 'test-results/artifacts',

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    baseURL: TEST_CONFIG.baseURL,
  },

  projects: [
    // Blazor WebAssembly Chrome Tests (simplified single target)
    {
      name: 'WASM Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*\.spec\.js/,
    },
  ],
});