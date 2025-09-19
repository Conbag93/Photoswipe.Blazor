const { test, expect } = require('@playwright/test');

test.describe('Overlay Control Positioning Tests', () => {
    const serverUrl = 'http://localhost:5224';
    const wasmUrl = 'http://localhost:5225';

    // Test both hosting models
    [
        { name: 'Server', baseUrl: serverUrl },
        { name: 'WASM', baseUrl: wasmUrl }
    ].forEach(({ name, baseUrl }) => {
        test.describe(`${name} Hosting Model`, () => {
            test.beforeEach(async ({ page }) => {
                await page.goto(`${baseUrl}/test/positioning`);
                await page.waitForLoadState('networkidle');
                await expect(page.locator('h1')).toContainText('🎯 Positioning Feature Test Page');
            });

            test('should position overlay controls correctly on desktop viewport', async ({ page }) => {
                // Set desktop viewport
                await page.setViewportSize({ width: 1920, height: 1080 });

                // Find the first gallery item in the positioning test gallery
                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                await expect(galleryItems.first()).toBeVisible();

                // Get the first gallery item and its overlay controls
                const firstItem = galleryItems.first();
                const itemBounds = await firstItem.boundingBox();

                // Find overlay controls within this item
                const heartControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="heart"]');
                const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
                const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

                // Verify controls are visible
                await expect(heartControl).toBeVisible();
                await expect(thumbsUpControl).toBeVisible();
                await expect(thumbsDownControl).toBeVisible();

                // Get actual positions
                const heartBounds = await heartControl.boundingBox();
                const thumbsUpBounds = await thumbsUpControl.boundingBox();
                const thumbsDownBounds = await thumbsDownControl.boundingBox();

                // Verify heart is in top-right area (updated for new positioning)
                expect(heartBounds.x).toBeGreaterThan(itemBounds.x + itemBounds.width / 2);
                expect(heartBounds.y).toBeLessThan(itemBounds.y + itemBounds.height / 2);

                // Verify thumbs controls are in bottom-right area
                expect(thumbsUpBounds.x).toBeGreaterThan(itemBounds.x + itemBounds.width / 2);
                expect(thumbsUpBounds.y).toBeGreaterThan(itemBounds.y + itemBounds.height / 2);

                expect(thumbsDownBounds.x).toBeGreaterThan(itemBounds.x + itemBounds.width / 2);
                expect(thumbsDownBounds.y).toBeGreaterThan(itemBounds.y + itemBounds.height / 2);

                // On desktop, thumbs controls might be horizontally positioned
                // Log actual positions for debugging
                console.log('Desktop positioning:', {
                    item: itemBounds,
                    heart: heartBounds,
                    thumbsUp: thumbsUpBounds,
                    thumbsDown: thumbsDownBounds
                });
            });

            test('should use vertical stacking on mobile viewport (constrained space)', async ({ page }) => {
                // Set mobile viewport (iPhone size)
                await page.setViewportSize({ width: 375, height: 667 });

                // Navigate and wait for load
                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                await expect(galleryItems.first()).toBeVisible();

                // Get the first gallery item
                const firstItem = galleryItems.first();
                const itemBounds = await firstItem.boundingBox();

                // Find the bottom-right overlay controls (these should stack vertically)
                const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
                const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

                await expect(thumbsUpControl).toBeVisible();
                await expect(thumbsDownControl).toBeVisible();

                // Get actual positions
                const thumbsUpBounds = await thumbsUpControl.boundingBox();
                const thumbsDownBounds = await thumbsDownControl.boundingBox();

                // Key assertion: On mobile, these should be vertically stacked
                // The "thumbs up" (spacing index 0) should be lower than "thumbs down" (spacing index 1)
                // because constrained space forces UP direction for BottomRight position
                expect(thumbsDownBounds.y).toBeLessThan(thumbsUpBounds.y,
                    `Thumbs down (${thumbsDownBounds.y}) should be ABOVE thumbs up (${thumbsUpBounds.y}) on mobile`);

                // X coordinates should be approximately the same (vertical stacking)
                const xDifference = Math.abs(thumbsUpBounds.x - thumbsDownBounds.x);
                expect(xDifference).toBeLessThan(10,
                    `X coordinates should be similar for vertical stacking (difference: ${xDifference})`);

                // Both should be in the bottom-right area of the item
                expect(thumbsUpBounds.x).toBeGreaterThan(itemBounds.x + itemBounds.width / 2);
                expect(thumbsDownBounds.x).toBeGreaterThan(itemBounds.x + itemBounds.width / 2);

                console.log('Mobile positioning:', {
                    viewport: { width: 375, height: 667 },
                    item: itemBounds,
                    thumbsUp: thumbsUpBounds,
                    thumbsDown: thumbsDownBounds,
                    yDifference: thumbsUpBounds.y - thumbsDownBounds.y,
                    xDifference: xDifference
                });
            });

            test('should calculate spacing correctly with multiple controls', async ({ page }) => {
                // Set mobile viewport to trigger constrained space behavior
                await page.setViewportSize({ width: 375, height: 667 });

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // Wait for all overlay controls to be visible
                const overlayControls = firstItem.locator('.photoswipe-overlay-control');
                await expect(overlayControls).toHaveCount(3); // heart, thumbs-up, thumbs-down

                // Measure the spacing between vertically stacked controls
                const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
                const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

                const thumbsUpBounds = await thumbsUpControl.boundingBox();
                const thumbsDownBounds = await thumbsDownControl.boundingBox();

                // Calculate the actual spacing between controls
                const actualSpacing = thumbsUpBounds.y - thumbsDownBounds.y;

                // Expected spacing should be approximately buttonSize + controlGap = 44 + 4 = 48px
                // Allow some tolerance for sub-pixel rendering and CSS calculations
                expect(actualSpacing).toBeGreaterThan(40);
                expect(actualSpacing).toBeLessThan(60);

                console.log('Spacing measurement:', {
                    actualSpacing,
                    expectedRange: '40-60px (44+4 with tolerance)'
                });
            });

            test('should respect custom positioning with CSS styles', async ({ page }) => {
                await page.setViewportSize({ width: 800, height: 600 });

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // Get computed styles for overlay controls
                const heartControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="heart"]');

                // Check that the control has proper CSS positioning
                const computedStyle = await heartControl.evaluate(el => {
                    const style = window.getComputedStyle(el);
                    return {
                        position: style.position,
                        top: style.top,
                        left: style.left,
                        right: style.right,
                        bottom: style.bottom
                    };
                });

                expect(computedStyle.position).toBe('absolute');

                // Heart should have top-left positioning
                expect(computedStyle.top).not.toBe('auto');
                expect(computedStyle.left).not.toBe('auto');

                console.log('CSS positioning:', computedStyle);
            });

            test('should handle edge cases with small containers', async ({ page }) => {
                // Test with very small viewport to stress-test positioning
                await page.setViewportSize({ width: 320, height: 568 }); // Small mobile

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // All controls should still be visible and positioned correctly
                const overlayControls = firstItem.locator('.photoswipe-overlay-control');
                const count = await overlayControls.count();

                for (let i = 0; i < count; i++) {
                    const control = overlayControls.nth(i);
                    await expect(control).toBeVisible();

                    // Each control should be within the viewport
                    const bounds = await control.boundingBox();
                    expect(bounds.x).toBeGreaterThanOrEqual(0);
                    expect(bounds.y).toBeGreaterThanOrEqual(0);
                    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
                    expect(bounds.y + bounds.height).toBeLessThanOrEqual(568);
                }
            });

            test('should prevent gallery opening when overlay controls are clicked', async ({ page }) => {
                await page.setViewportSize({ width: 1024, height: 768 });

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // Click on an overlay control
                const heartControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="heart"] button');
                await heartControl.click();

                // Gallery/lightbox should NOT open
                const lightbox = page.locator('.pswp');
                await expect(lightbox).not.toBeVisible();

                // Click on the image itself (not the overlay)
                const image = firstItem.locator('a[data-pswp-width]');
                await image.click();

                // Now the gallery SHOULD open
                await expect(lightbox).toBeVisible();

                // Close the gallery
                await page.keyboard.press('Escape');
                await expect(lightbox).not.toBeVisible();
            });

            test('should maintain positioning during window resize', async ({ page }) => {
                // Start with desktop size
                await page.setViewportSize({ width: 1200, height: 800 });

                const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
                const firstItem = galleryItems.first();

                // Get initial positions
                const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
                const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

                const initialThumbsUp = await thumbsUpControl.boundingBox();
                const initialThumbsDown = await thumbsDownControl.boundingBox();

                // Resize to mobile
                await page.setViewportSize({ width: 375, height: 667 });
                await page.waitForTimeout(100); // Allow for CSS transitions

                // Get new positions
                const mobileThumbsUp = await thumbsUpControl.boundingBox();
                const mobileThumbsDown = await thumbsDownControl.boundingBox();

                // On mobile, should switch to vertical stacking
                expect(mobileThumbsDown.y).toBeLessThan(mobileThumbsUp.y,
                    'Should use vertical stacking on mobile');

                console.log('Resize positioning:', {
                    desktop: { thumbsUp: initialThumbsUp, thumbsDown: initialThumbsDown },
                    mobile: { thumbsUp: mobileThumbsUp, thumbsDown: mobileThumbsDown }
                });
            });
        });
    });

    test.describe('Cross-Browser Positioning Consistency', () => {
        test('should position controls consistently across browsers', async ({ page, browserName }) => {
            await page.goto(`${serverUrl}/test/positioning`);
            await page.setViewportSize({ width: 375, height: 667 });

            const galleryItems = page.locator('#positioning-test-gallery .gallery-item-wrapper');
            const firstItem = galleryItems.first();

            const thumbsUpControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').first();
            const thumbsDownControl = firstItem.locator('.photoswipe-overlay-control[data-pswp-control-type="rating"]').last();

            const thumbsUpBounds = await thumbsUpControl.boundingBox();
            const thumbsDownBounds = await thumbsDownControl.boundingBox();

            // Vertical stacking should work consistently across all browsers
            expect(thumbsDownBounds.y).toBeLessThan(thumbsUpBounds.y,
                `Vertical stacking should work in ${browserName}`);

            console.log(`${browserName} positioning:`, {
                thumbsUp: thumbsUpBounds,
                thumbsDown: thumbsDownBounds,
                spacing: thumbsUpBounds.y - thumbsDownBounds.y
            });
        });
    });
});