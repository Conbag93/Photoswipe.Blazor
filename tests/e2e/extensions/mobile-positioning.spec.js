const { test, expect } = require('@playwright/test');

test.describe('Mobile Positioning Comprehensive Tests', () => {
    const serverUrl = 'http://localhost:5224';
    const wasmUrl = 'http://localhost:5225';

    // Test various mobile viewport sizes
    const mobileViewports = [
        { name: 'iPhone SE', width: 375, height: 667 },
        { name: 'iPhone 12', width: 390, height: 844 },
        { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
        { name: 'Samsung Galaxy S21', width: 360, height: 800 },
        { name: 'Pixel 5', width: 393, height: 851 }
    ];

    [
        { name: 'Server', baseUrl: serverUrl },
        { name: 'WASM', baseUrl: wasmUrl }
    ].forEach(({ name, baseUrl }) => {
        test.describe(`${name} Hosting Model`, () => {
            mobileViewports.forEach(viewport => {
                test(`should handle constrained spacing on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
                    // Set specific mobile viewport
                    await page.setViewportSize({ width: viewport.width, height: viewport.height });

                    await page.goto(`${baseUrl}/test/positioning`);
                    await page.waitForLoadState('networkidle');

                    // Find gallery items
                    const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                    await expect(galleryItems.first()).toBeVisible();

                    const firstItem = galleryItems.first();
                    const itemBounds = await firstItem.boundingBox();

                    // Get bottom-right controls that should stack vertically
                    const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
                    const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

                    await expect(thumbsUpControl).toBeVisible();
                    await expect(thumbsDownControl).toBeVisible();

                    const thumbsUpBounds = await thumbsUpControl.boundingBox();
                    const thumbsDownBounds = await thumbsDownControl.boundingBox();

                    // Key assertion: Vertical stacking should work on ALL mobile sizes
                    expect(thumbsDownBounds.y).toBeLessThan(thumbsUpBounds.y,
                        `On ${viewport.name}: thumbs down should be ABOVE thumbs up (constrained space)`);

                    // Controls should be approximately aligned horizontally
                    const xDifference = Math.abs(thumbsUpBounds.x - thumbsDownBounds.x);
                    expect(xDifference).toBeLessThan(15,
                        `On ${viewport.name}: controls should be vertically aligned (x-diff: ${xDifference})`);

                    // Calculate spacing
                    const spacing = thumbsUpBounds.y - thumbsDownBounds.y;
                    expect(spacing).toBeGreaterThan(35,
                        `On ${viewport.name}: spacing should be adequate (got ${spacing}px)`);
                    expect(spacing).toBeLessThan(65,
                        `On ${viewport.name}: spacing should not be excessive (got ${spacing}px)`);

                    // Controls should be within the gallery item bounds
                    expect(thumbsUpBounds.x).toBeGreaterThan(itemBounds.x - 5);
                    expect(thumbsUpBounds.x + thumbsUpBounds.width).toBeLessThan(itemBounds.x + itemBounds.width + 5);
                    expect(thumbsDownBounds.x).toBeGreaterThan(itemBounds.x - 5);
                    expect(thumbsDownBounds.x + thumbsDownBounds.width).toBeLessThan(itemBounds.x + itemBounds.width + 5);

                    console.log(`${viewport.name} results:`, {
                        viewport: viewport,
                        item: { width: itemBounds.width, height: itemBounds.height },
                        thumbsUp: { x: thumbsUpBounds.x, y: thumbsUpBounds.y },
                        thumbsDown: { x: thumbsDownBounds.x, y: thumbsDownBounds.y },
                        spacing: spacing,
                        xAlignment: xDifference
                    });
                });
            });

            test('should handle orientation changes correctly', async ({ page }) => {
                // Start in portrait
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto(`${baseUrl}/test/positioning`);

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // Get initial positioning
                const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
                const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

                const portraitThumbsUp = await thumbsUpControl.boundingBox();
                const portraitThumbsDown = await thumbsDownControl.boundingBox();

                // Rotate to landscape
                await page.setViewportSize({ width: 667, height: 375 });
                await page.waitForTimeout(100); // Allow for reflow

                const landscapeThumbsUp = await thumbsUpControl.boundingBox();
                const landscapeThumbsDown = await thumbsDownControl.boundingBox();

                // In both orientations, should maintain vertical stacking for constrained controls
                expect(portraitThumbsDown.y).toBeLessThan(portraitThumbsUp.y,
                    'Portrait: should use vertical stacking');
                expect(landscapeThumbsDown.y).toBeLessThan(landscapeThumbsUp.y,
                    'Landscape: should maintain vertical stacking');

                console.log('Orientation change results:', {
                    portrait: {
                        thumbsUp: portraitThumbsUp,
                        thumbsDown: portraitThumbsDown,
                        spacing: portraitThumbsUp.y - portraitThumbsDown.y
                    },
                    landscape: {
                        thumbsUp: landscapeThumbsUp,
                        thumbsDown: landscapeThumbsDown,
                        spacing: landscapeThumbsUp.y - landscapeThumbsDown.y
                    }
                });
            });

            test('should maintain touch target sizes on mobile', async ({ page }) => {
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto(`${baseUrl}/test/positioning`);

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // Check button sizes meet mobile accessibility guidelines (44px minimum)
                const overlayButtons = firstItem.locator('.photoswipe-overlay-control button');
                const buttonCount = await overlayButtons.count();

                for (let i = 0; i < buttonCount; i++) {
                    const button = overlayButtons.nth(i);
                    const bounds = await button.boundingBox();

                    // Minimum 44px touch target per accessibility guidelines
                    expect(bounds.width).toBeGreaterThanOrEqual(40,
                        `Button ${i} width should meet touch guidelines`);
                    expect(bounds.height).toBeGreaterThanOrEqual(40,
                        `Button ${i} height should meet touch guidelines`);
                }
            });

            test('should prevent horizontal overflow on narrow screens', async ({ page }) => {
                // Test with very narrow screen
                await page.setViewportSize({ width: 320, height: 568 });
                await page.goto(`${baseUrl}/test/positioning`);

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // All overlay controls should be within viewport bounds
                const overlayControls = firstItem.locator('.photoswipe-overlay-control');
                const controlCount = await overlayControls.count();

                for (let i = 0; i < controlCount; i++) {
                    const control = overlayControls.nth(i);
                    const bounds = await control.boundingBox();

                    expect(bounds.x).toBeGreaterThanOrEqual(0,
                        `Control ${i} should not overflow left edge`);
                    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320,
                        `Control ${i} should not overflow right edge`);
                    expect(bounds.y).toBeGreaterThanOrEqual(0,
                        `Control ${i} should not overflow top edge`);
                    expect(bounds.y + bounds.height).toBeLessThanOrEqual(568,
                        `Control ${i} should not overflow bottom edge`);
                }
            });

            test('should handle rapid resize events without layout break', async ({ page }) => {
                await page.goto(`${baseUrl}/test/positioning`);

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // Rapid resize simulation
                const sizes = [
                    { width: 375, height: 667 },
                    { width: 414, height: 896 },
                    { width: 360, height: 800 },
                    { width: 393, height: 851 },
                    { width: 375, height: 667 } // Back to start
                ];

                for (const size of sizes) {
                    await page.setViewportSize(size);
                    await page.waitForTimeout(50); // Brief wait

                    // Verify controls are still visible and positioned
                    const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]');
                    const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]');

                    await expect(thumbsUpControl).toBeVisible();
                    await expect(thumbsDownControl).toBeVisible();

                    const thumbsUpBounds = await thumbsUpControl.boundingBox();
                    const thumbsDownBounds = await thumbsDownControl.boundingBox();

                    // Should maintain vertical stacking throughout resizes
                    expect(thumbsDownBounds.y).toBeLessThan(thumbsUpBounds.y,
                        `At ${size.width}x${size.height}: should maintain vertical stacking`);
                }
            });

            test('should work correctly with CSS zoom and scaling', async ({ page }) => {
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto(`${baseUrl}/test/positioning`);

                // Apply CSS zoom (simulates browser zoom or high-DPI scaling)
                await page.addStyleTag({
                    content: `
                        .photoswipe-upload-gallery {
                            zoom: 1.25;
                        }
                    `
                });

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
                const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

                await expect(thumbsUpControl).toBeVisible();
                await expect(thumbsDownControl).toBeVisible();

                const thumbsUpBounds = await thumbsUpControl.boundingBox();
                const thumbsDownBounds = await thumbsDownControl.boundingBox();

                // Even with zoom, vertical stacking should work
                expect(thumbsDownBounds.y).toBeLessThan(thumbsUpBounds.y,
                    'Vertical stacking should work with CSS zoom');

                console.log('Zoom test results:', {
                    thumbsUp: thumbsUpBounds,
                    thumbsDown: thumbsDownBounds,
                    spacing: thumbsUpBounds.y - thumbsDownBounds.y
                });
            });

            test('should handle dynamic content changes correctly', async ({ page }) => {
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto(`${baseUrl}/test/positioning`); // Use positioning test page for dynamic content

                // This page has configurable overlay positioning
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems.first()).toBeVisible();

                const firstItem = galleryItems.first();

                // Change delete button position dynamically
                const bottomRightRadio = page.locator('input[type="radio"][name="delete-position"]').nth(2); // Bottom Right
                await bottomRightRadio.check();

                // Verify the positioning change took effect
                const deleteControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="delete"]');
                await expect(deleteControl).toBeVisible();

                const deleteBounds = await deleteControl.boundingBox();
                const itemBounds = await firstItem.boundingBox();

                // Should be in bottom-right area
                expect(deleteBounds.x).toBeGreaterThan(itemBounds.x + itemBounds.width / 2);
                expect(deleteBounds.y).toBeGreaterThan(itemBounds.y + itemBounds.height / 2);

                console.log('Dynamic positioning test:', {
                    item: itemBounds,
                    deleteButton: deleteBounds
                });
            });
        });
    });
});