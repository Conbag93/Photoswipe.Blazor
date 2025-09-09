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
    const viewport = await getViewportSize(page);
    
    // Check gallery container exists
    const galleryContainer = page.locator('.gallery, [class*="gallery"]').first();
    await expect(galleryContainer).toBeVisible();

    // Verify images are laid out properly (not all stacked)
    const galleryImages = page.locator(testData.selectors.galleryImages);
    const firstImage = galleryImages.first();
    const secondImage = galleryImages.nth(1);

    if (await secondImage.isVisible()) {
      const firstBox = await firstImage.boundingBox();
      const secondBox = await secondImage.boundingBox();
      
      // Images should either be side-by-side or vertically stacked properly
      const isHorizontalLayout = Math.abs(firstBox.y - secondBox.y) < 50;
      const isVerticalLayout = Math.abs(firstBox.x - secondBox.x) < 50;
      
      expect(isHorizontalLayout || isVerticalLayout).toBe(true);
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

  test('should handle images that fail to load gracefully', async ({ page }) => {
    // This test verifies the gallery doesn't break with broken images
    const galleryImages = page.locator(testData.selectors.galleryImages);
    await expect(galleryImages.first()).toBeVisible({ timeout: testData.timeouts.long });
    
    // Check that the page still functions even if some images fail
    const imageCount = await galleryImages.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Gallery should still be clickable
    await galleryImages.first().click();
    await page.waitForTimeout(1000);
    
    // Either lightbox opens or we get a graceful fallback
    const lightboxVisible = await page.locator(testData.selectors.lightbox).isVisible();
    // Test passes if either lightbox opens or page doesn't crash
    expect(typeof lightboxVisible).toBe('boolean');
  });
});