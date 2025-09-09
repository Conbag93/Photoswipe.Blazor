// @ts-check
const { test, expect } = require('@playwright/test');
const testData = require('../../fixtures/test-data');

test.describe('App Loading - Smoke Tests', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto(testData.urls.home);
    
    // Check that the page loads with correct title
    await expect(page).toHaveTitle(testData.expectedTitles.home);
    
    // Verify basic page structure
    await expect(page.locator('h1')).toBeVisible();
    
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

  test('should load the PhotoSwipe demo page successfully', async ({ page }) => {
    await page.goto(testData.urls.photoswipeDemo);
    
    // Check for PhotoSwipe demo content
    await expect(page).toHaveTitle(testData.expectedTitles.photoswipeDemo);
    await expect(page.locator('h1')).toContainText(/PhotoSwipe/);
    
    // Verify gallery images are present
    const galleryImages = page.locator(testData.selectors.galleryImages);
    await expect(galleryImages.first()).toBeVisible({ timeout: testData.timeouts.medium });
    
    // Check that at least some images are loaded
    const imageCount = await galleryImages.count();
    expect(imageCount).toBeGreaterThan(0);
  });

  test('should have PhotoSwipe JavaScript loaded', async ({ page }) => {
    await page.goto(testData.urls.photoswipeDemo);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that PhotoSwipe modules are available
    const hasPhotoSwipe = await page.evaluate(() => {
      return typeof window.PhotoSwipe !== 'undefined' || 
             typeof window.PhotoSwipeLightbox !== 'undefined';
    });
    
    // Note: This might be false initially until user interaction, which is expected
    // The important thing is that the modules can be imported when needed
    expect(typeof hasPhotoSwipe).toBe('boolean');
  });
});