const { test, expect } = require('@playwright/test');

test.describe('PhotoSwipe Error Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for JavaScript errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`🚨 JavaScript Error: ${msg.text()}`);
      }
    });

    // Listen for network errors
    page.on('requestfailed', (request) => {
      console.log(`🌐 Network Error: ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto('http://localhost:5224/extended-features-demo');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.photoswipe-upload-gallery', { timeout: 10000 });
  });

  test('should detect JavaScript console errors during PhotoSwipe interactions', async ({ page }) => {
    const consoleMessages = [];

    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Switch to single selection mode
    await page.locator('input[type="radio"][name="selection"]').nth(1).click();
    await page.waitForTimeout(500);

    // Try to click a radio button in the selection-deletion gallery
    const firstRadio = page.locator('#selection-deletion-gallery input[type="radio"].selection-radio').first();
    await expect(firstRadio).toBeVisible();
    await firstRadio.click();
    await page.waitForTimeout(1000);

    // Check for JavaScript errors
    const errors = consoleMessages.filter(msg => msg.type === 'error');

    if (errors.length > 0) {
      console.log('🚨 JavaScript Errors Found:');
      errors.forEach(error => {
        console.log(`  - ${error.text} (${error.location?.url}:${error.location?.lineNumber})`);
      });
    }

    // Log all console messages for debugging
    console.log('📝 All Console Messages:');
    consoleMessages.forEach(msg => {
      console.log(`  [${msg.type}] ${msg.text}`);
    });

    expect(errors.length).toBe(0);
  });
});