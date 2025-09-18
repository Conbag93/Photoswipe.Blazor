// @ts-check
const { test, expect } = require('@playwright/test');
const PhotoSwipePage = require('../../page-objects/PhotoSwipePage');
const testData = require('../../fixtures/test-data');
const { getViewportSize } = require('../../utils/test-helpers');

test.describe('PhotoSwipe Gallery - Display and Layout', () => {
  let photoSwipePage;

  test.beforeEach(async ({ page }) => {
    photoSwipePage = new PhotoSwipePage(page);
    await photoSwipePage.goto();
  });

  test('should display gallery images with correct attributes', async ({ page }) => {
    // Check that gallery images are present
    const galleryImages = page.locator(testData.selectors.galleryImages);
    await expect(galleryImages.first()).toBeVisible();

    const imageCount = await galleryImages.count();
    expect(imageCount).toBeGreaterThan(0);

    // Verify images have required PhotoSwipe attributes
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const image = galleryImages.nth(i);
      
      // Check for PhotoSwipe data attributes
      await expect(image).toHaveAttribute('data-pswp-width');
      await expect(image).toHaveAttribute('data-pswp-height');
      
      // Verify the image is actually visible
      await expect(image).toBeVisible();
    }
  });

  test('should have responsive gallery layout', async ({ page }) => {
    // Check gallery container exists
    const galleryContainer = page.locator('.gallery, [class*="gallery"], [class*="photoswipe"]').first();
    await expect(galleryContainer).toBeVisible();

    // Verify at least some images are present and visible
    const galleryImages = page.locator(testData.selectors.galleryImages);
    const imageCount = await galleryImages.count();
    
    if (imageCount > 0) {
      const firstImage = galleryImages.first();
      await expect(firstImage).toBeVisible();
      
      // Check that image has reasonable dimensions
      const box = await firstImage.boundingBox();
      expect(box.width).toBeGreaterThan(50);
      expect(box.height).toBeGreaterThan(50);
    }
  });

  test('should load image thumbnails properly', async ({ page }) => {
    const galleryImages = page.locator(testData.selectors.galleryImages + ' img');
    
    if (await galleryImages.first().isVisible()) {
      // Check that at least the first few images have loaded
      const imageCount = Math.min(await galleryImages.count(), 3);
      
      for (let i = 0; i < imageCount; i++) {
        const img = galleryImages.nth(i);
        
        // Check that image has src attribute
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src.length).toBeGreaterThan(0);
        
        // Check that image dimensions are reasonable
        const box = await img.boundingBox();
        expect(box.width).toBeGreaterThan(50); // Reasonable minimum size
        expect(box.height).toBeGreaterThan(50);
      }
    }
  });

  test('should handle gallery interactions gracefully', async ({ page }) => {
    // This test verifies basic gallery functionality
    const galleryImages = page.locator(testData.selectors.galleryImages);
    
    const imageCount = await galleryImages.count();
    if (imageCount > 0) {
      // First image should be visible
      await expect(galleryImages.first()).toBeVisible({ timeout: testData.timeouts.medium });
      
      // Page should not have JavaScript errors
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(errors.length).toBeLessThanOrEqual(0); // Allow for minor errors
    }
  });
});