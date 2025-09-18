// @ts-check
const { test, expect } = require('@playwright/test');
const testData = require('../../fixtures/test-data');
const { waitForBlazorPhotoSwipeInit } = require('../../utils/test-helpers');

test.describe('App Loading - Smoke Tests', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto(testData.urls.home);

    // Verify basic page structure - h1 exists even if not immediately visible
    await expect(page.locator('h1')).toHaveCount(1);

    // Check for no console errors
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to capture any delayed errors
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should load the Basic PhotoSwipe demo page successfully', async ({ page }) => {
    await page.goto(testData.urls.basicPhotoswipeDemo);
    await waitForBlazorPhotoSwipeInit(page, testData.selectors.galleryImages, 4);

    // Check for PhotoSwipe demo content
    await expect(page.locator('h1')).toContainText(/PhotoSwipe/);

    // Verify gallery images are present
    const galleryImages = page.locator(testData.selectors.galleryImages);
    await expect(galleryImages.first()).toBeVisible();

    // Check that at least some images are loaded
    const imageCount = await galleryImages.count();
    expect(imageCount).toBeGreaterThan(0);
  });

  test('should have PhotoSwipe JavaScript loaded', async ({ page }) => {
    await page.goto(testData.urls.basicPhotoswipeDemo);
    await waitForBlazorPhotoSwipeInit(page, testData.selectors.galleryImages, 4);

    // Check that PhotoSwipe scripts are loaded in the DOM
    const hasPhotoSwipeScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script =>
        script.src.includes('photoswipe') ||
        script.src.includes('_content/PhotoSwipe.Blazor')
      );
    });

    // Verify PhotoSwipe scripts are loaded
    expect(hasPhotoSwipeScript).toBe(true);
  });
});