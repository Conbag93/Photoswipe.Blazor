const { test, expect } = require('@playwright/test');

test.describe('Extended Features Demo - Circuit Stability & Error Detection', () => {
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

  test('should not cause circuit disconnections when clicking selection elements', async ({ page }) => {
    // Switch to multi-select mode
    await page.locator('input[type="radio"][name="selection"]').nth(2).click();
    await page.waitForTimeout(500);

    // Find first checkbox
    const firstCheckbox = page.locator('input[type="checkbox"].selection-checkbox').first();
    await expect(firstCheckbox).toBeVisible();

    // Click checkbox and check for circuit stability
    await firstCheckbox.click();
    await page.waitForTimeout(1000); // Give time for any circuit issues to manifest

    // Check if Blazor is still connected by trying to interact with other controls
    const modeRadio = page.locator('input[type="radio"][name="selection"]').first();
    await modeRadio.click();
    await page.waitForTimeout(500);

    // Switch back to multi-select and verify the page is still responsive
    await page.locator('input[type="radio"][name="selection"]').nth(2).click();
    await page.waitForTimeout(500);

    // Verify elements are still interactive
    const checkboxAfterModeSwitch = page.locator('input[type="checkbox"].selection-checkbox').first();
    await expect(checkboxAfterModeSwitch).toBeVisible();

    // This click should work if the circuit is stable
    await checkboxAfterModeSwitch.click();
    await expect(checkboxAfterModeSwitch).toBeChecked();
  });

  test('should detect JavaScript console errors during interaction', async ({ page }) => {
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

    // Try to click a radio button
    const firstRadio = page.locator('input[type="radio"].selection-radio').first();
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

  test('should maintain Blazor connection during repeated interactions', async ({ page }) => {
    // Test multiple rapid interactions to stress-test the circuit

    // Switch modes multiple times rapidly
    for (let i = 0; i < 3; i++) {
      await page.locator('input[type="radio"][name="selection"]').nth(0).click(); // None
      await page.waitForTimeout(200);
      await page.locator('input[type="radio"][name="selection"]').nth(1).click(); // Single
      await page.waitForTimeout(200);
      await page.locator('input[type="radio"][name="selection"]').nth(2).click(); // Multi
      await page.waitForTimeout(200);
    }

    // Verify the page is still functional
    const checkbox = page.locator('input[type="checkbox"].selection-checkbox').first();
    await expect(checkbox).toBeVisible();

    // This should work if Blazor is still connected
    await checkbox.click();
    await page.waitForTimeout(500);

    // Verify the status panel updates (this requires server communication)
    const statusPanel = page.locator('.status-panel');
    await expect(statusPanel).toBeVisible();

    // Check if we can see the "Selected" status (this would only show if the server got the update)
    const statusItems = await page.locator('.status-item');
    const count = await statusItems.count();

    let foundSelectedStatus = false;
    for (let i = 0; i < count; i++) {
      const text = await statusItems.nth(i).textContent();
      if (text && text.includes('Selected:')) {
        foundSelectedStatus = true;
        break;
      }
    }

    console.log(`📊 Status panel shows selected items: ${foundSelectedStatus}`);
  });

  test('should check SignalR connection stability', async ({ page }) => {
    // Monitor network activity for SignalR disconnections
    const failedRequests = [];

    page.on('requestfailed', (request) => {
      failedRequests.push({
        url: request.url(),
        method: request.method(),
        errorText: request.failure()?.errorText
      });
    });

    // Switch to multi-select and interact
    await page.locator('input[type="radio"][name="selection"]').nth(2).click();
    await page.waitForTimeout(500);

    const checkbox = page.locator('input[type="checkbox"].selection-checkbox').first();
    await checkbox.click();
    await page.waitForTimeout(2000); // Wait for any delayed network activity

    // Check for failed requests (especially SignalR negotiate/connect requests)
    const signalRFailures = failedRequests.filter(req =>
      req.url.includes('_blazor') || req.url.includes('negotiate') || req.url.includes('hub')
    );

    if (signalRFailures.length > 0) {
      console.log('🚨 SignalR Connection Issues Found:');
      signalRFailures.forEach(failure => {
        console.log(`  - ${failure.method} ${failure.url}: ${failure.errorText}`);
      });
    }

    // Log all failed requests for debugging
    if (failedRequests.length > 0) {
      console.log('📝 All Failed Requests:');
      failedRequests.forEach(failure => {
        console.log(`  - ${failure.method} ${failure.url}: ${failure.errorText}`);
      });
    }

    expect(signalRFailures.length).toBe(0);
  });
});