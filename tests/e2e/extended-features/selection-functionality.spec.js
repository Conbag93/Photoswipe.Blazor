const { test, expect } = require('@playwright/test');

test.describe('Extended Features Demo - Selection Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5224/extended-features-demo');
    await page.waitForLoadState('networkidle');
    // Wait for PhotoSwipe to initialize
    await page.waitForSelector('.photoswipe-upload-gallery', { timeout: 10000 });
  });

  test('should show radio buttons in single selection mode', async ({ page }) => {
    // Select Single selection mode (click the second radio button - Single)
    await page.locator('input[type="radio"][name="selection"]').nth(1).click();
    await page.waitForTimeout(500); // Allow UI to update

    // Check if radio buttons are visible
    const radioButtons = await page.locator('input[type="radio"].selection-radio');
    const count = await radioButtons.count();

    console.log(`Found ${count} radio buttons in single selection mode`);
    expect(count).toBeGreaterThan(0);

    // Verify they are visible
    for (let i = 0; i < count; i++) {
      await expect(radioButtons.nth(i)).toBeVisible();
    }
  });

  test('should show checkboxes in multi selection mode', async ({ page }) => {
    // Select Multi selection mode (click the third radio button - Multi)
    await page.locator('input[type="radio"][name="selection"]').nth(2).click();
    await page.waitForTimeout(500); // Allow UI to update

    // Check if checkboxes are visible
    const checkboxes = await page.locator('input[type="checkbox"].selection-checkbox');
    const count = await checkboxes.count();

    console.log(`Found ${count} checkboxes in multi selection mode`);
    expect(count).toBeGreaterThan(0);

    // Verify they are visible
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeVisible();
    }
  });

  test('should allow clicking checkboxes without opening PhotoSwipe gallery', async ({ page }) => {
    // Select Multi selection mode (click the third radio button - Multi)
    await page.locator('input[type="radio"][name="selection"]').nth(2).click();
    await page.waitForTimeout(500);

    // Find first checkbox
    const firstCheckbox = page.locator('input[type="checkbox"].selection-checkbox').first();
    await expect(firstCheckbox).toBeVisible();

    // Click the checkbox
    await firstCheckbox.click();
    await page.waitForTimeout(500);

    // Verify checkbox is checked
    await expect(firstCheckbox).toBeChecked();

    // Verify PhotoSwipe modal/lightbox did NOT open
    const lightbox = page.locator('.pswp');
    await expect(lightbox).not.toBeVisible();

    // Verify selection count updated
    const selectedCount = await page.locator('.status-value').nth(1).textContent();
    expect(selectedCount).toBe('1');
  });

  test('should allow clicking radio buttons without opening PhotoSwipe gallery', async ({ page }) => {
    // Select Single selection mode (click the second radio button - Single)
    await page.locator('input[type="radio"][name="selection"]').nth(1).click();
    await page.waitForTimeout(500);

    // Find first radio button
    const firstRadio = page.locator('input[type="radio"].selection-radio').first();
    await expect(firstRadio).toBeVisible();

    // Click the radio button
    await firstRadio.click();
    await page.waitForTimeout(500);

    // Verify radio is selected
    await expect(firstRadio).toBeChecked();

    // Verify PhotoSwipe modal/lightbox did NOT open
    const lightbox = page.locator('.pswp');
    await expect(lightbox).not.toBeVisible();

    // Verify selection count updated
    const selectedCount = await page.locator('.status-value').nth(1).textContent();
    expect(selectedCount).toBe('1');
  });

  test('should still open PhotoSwipe when clicking gallery images (not overlay elements)', async ({ page }) => {
    // Select Multi selection mode to have checkboxes visible (click the third radio button - Multi)
    await page.locator('input[type="radio"][name="selection"]').nth(2).click();
    await page.waitForTimeout(500);

    // Find first gallery image (not the checkbox overlay)
    const firstImage = page.locator('.gallery-image').first();
    await expect(firstImage).toBeVisible();

    // Click on the image itself
    await firstImage.click();
    await page.waitForTimeout(1000);

    // Verify PhotoSwipe modal/lightbox DID open
    const lightbox = page.locator('.pswp');
    await expect(lightbox).toBeVisible();

    // Close the lightbox
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should not show any selection controls in None mode', async ({ page }) => {
    // Select None selection mode (click the first radio button - None)
    await page.locator('input[type="radio"][name="selection"]').nth(0).click();
    await page.waitForTimeout(500);

    // Verify no checkboxes are visible
    const checkboxes = await page.locator('input[type="checkbox"].selection-checkbox');
    await expect(checkboxes).toHaveCount(0);

    // Verify no radio buttons are visible
    const radioButtons = await page.locator('input[type="radio"].selection-radio');
    await expect(radioButtons).toHaveCount(0);

    // Verify no selection status is shown
    const statusItems = await page.locator('.status-item');
    const statusCount = await statusItems.count();

    // Should only show "Total Images" status, not "Selected" status
    for (let i = 0; i < statusCount; i++) {
      const text = await statusItems.nth(i).textContent();
      expect(text).not.toContain('Selected:');
    }
  });
});