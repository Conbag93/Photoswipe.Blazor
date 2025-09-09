// @ts-check
const { test, expect } = require('@playwright/test');
const PhotoSwipePage = require('../../page-objects/PhotoSwipePage');
const testData = require('../../fixtures/test-data');
const { takeScreenshot } = require('../../utils/test-helpers');

test.describe('PhotoSwipe Lightbox - Basic Functionality', () => {
  let photoSwipePage;

  test.beforeEach(async ({ page }) => {
    photoSwipePage = new PhotoSwipePage(page);
    await photoSwipePage.goto();
  });

  test('should open lightbox when clicking first image', async ({ page }) => {
    // Arrange: Verify gallery is loaded
    const imageCount = await photoSwipePage.getGalleryImageCount();
    expect(imageCount).toBeGreaterThan(0);

    // Act: Click first image
    await photoSwipePage.openFirstImage();
    await photoSwipePage.waitForLightboxAnimation();

    // Assert: Lightbox should be open
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);
    
    // Take screenshot for visual verification
    await takeScreenshot(page, 'lightbox-opened');
  });

  test('should close lightbox when clicking close button', async ({ page }) => {
    // Arrange: Open lightbox
    await photoSwipePage.openFirstImage();
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);

    // Act: Close lightbox
    await photoSwipePage.closeLightbox();
    await photoSwipePage.waitForLightboxAnimation();

    // Assert: Lightbox should be closed
    expect(await photoSwipePage.isLightboxClosed()).toBe(true);
  });

  test('should close lightbox with Escape key', async ({ page }) => {
    // Arrange: Open lightbox
    await photoSwipePage.openFirstImage();
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);

    // Act: Press Escape key
    await page.keyboard.press('Escape');
    await photoSwipePage.waitForLightboxAnimation();

    // Assert: Lightbox should be closed
    expect(await photoSwipePage.isLightboxClosed()).toBe(true);
  });

  test('should navigate between images using next/prev buttons', async ({ page }) => {
    const imageCount = await photoSwipePage.getGalleryImageCount();
    
    // Only run if we have multiple images
    test.skip(imageCount < 2, 'Test requires at least 2 images');

    // Arrange: Open first image
    await photoSwipePage.openFirstImage();
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);

    // Act: Navigate to next image
    await photoSwipePage.navigateNext();
    await photoSwipePage.waitForLightboxAnimation();

    // Assert: Still in lightbox (basic check)
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);

    // Act: Navigate back to previous image  
    await photoSwipePage.navigatePrev();
    await photoSwipePage.waitForLightboxAnimation();

    // Assert: Still in lightbox
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);
  });

  test('should navigate with keyboard arrows', async ({ page }) => {
    const imageCount = await photoSwipePage.getGalleryImageCount();
    test.skip(imageCount < 2, 'Test requires at least 2 images');

    // Arrange: Open lightbox
    await photoSwipePage.openFirstImage();
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);

    // Act: Use arrow keys to navigate
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    expect(await photoSwipePage.isLightboxOpen()).toBe(true);
  });
});