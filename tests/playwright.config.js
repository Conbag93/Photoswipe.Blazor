// @ts-check
const { defineConfig, devices } = require('@playwright/test');

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
  },

  projects: [
    // Blazor Server Tests (Interactive Server mode)
    {
      name: 'Server Chrome',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5224',
      },
      testMatch: /.*\.spec\.js/,
    },
    {
      name: 'Server Firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:5224',
      },
      testMatch: /.*\.spec\.js/,
    },

    // Blazor WebAssembly Tests (Client-side interactivity)
    {
      name: 'WASM Chrome',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5225',
      },
      testMatch: /.*\.spec\.js/,
    },
    {
      name: 'WASM Firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:5225',
      },
      testMatch: /.*\.spec\.js/,
    },

    // Mobile Tests (both hosting models)
    {
      name: 'Server Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:5224',
      },
      testMatch: /.*\.spec\.js/,
    },
    {
      name: 'WASM Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:5225',
      },
      testMatch: /.*\.spec\.js/,
    },
  ],

  // globalSetup: './utils/global-setup.js',
  // globalTeardown: './utils/global-teardown.js',

  // webServer: {
  //   command: 'echo "PhotoSwipe sample app should be running at http://localhost:3000"',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: true,
  //   timeout: 10000,
  // },
});