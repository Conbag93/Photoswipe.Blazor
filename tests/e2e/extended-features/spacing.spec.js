const { test, expect } = require('@playwright/test');

test.describe('PhotoSwipe Overlay Controls - Smart Spacing System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5224/extended-features-demo');
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        // Wait for gallery initialization
        await page.waitForSelector('.position-demo-section', { timeout: 10000 });

        // Scroll to position demo section
        await page.getByText('📍 Position Demo').scrollIntoViewIfNeeded();
    });

    test('should show position controls and demo gallery', async ({ page }) => {
        // Verify position control sections exist
        await expect(page.getByText('Heart Position:')).toBeVisible();
        await expect(page.getByText('Thumbs Position:')).toBeVisible();
        await expect(page.getByText('Share Position:')).toBeVisible();
        await expect(page.getByText('Grow Direction:')).toBeVisible();

        // Verify position demo gallery exists
        await expect(page.locator('#position-demo-gallery')).toBeVisible();

        // Verify position guide exists
        await expect(page.getByText('📐 Position Guide:')).toBeVisible();
    });

    test('should detect position conflicts when controls share same position', async ({ page }) => {
        // Set Heart and Thumbs to same position (Top Left)
        await page.getByRole('radio', { name: 'Top Left' }).first().check(); // Heart position
        await page.getByRole('radio', { name: 'Top Left' }).nth(1).check(); // Thumbs position

        // Wait for state update
        await page.waitForTimeout(500);

        // Verify conflict is detected
        await expect(page.getByText('⚠️ Position Conflicts Detected:')).toBeVisible();
        await expect(page.getByText('Top Left:')).toBeVisible();
        await expect(page.getByText('sharing same position')).toBeVisible();
    });

    test('should render overlay controls with spacing when positions conflict', async ({ page }) => {
        // Set all controls to Top Left position to test spacing
        await page.getByRole('radio', { name: 'Top Left' }).first().check(); // Heart
        await page.getByRole('radio', { name: 'Top Left' }).nth(1).check(); // Thumbs
        await page.getByRole('radio', { name: 'Top Left' }).nth(2).check(); // Share

        // Wait for state update
        await page.waitForTimeout(500);

        // Verify all overlay controls are rendered in position demo gallery
        const galleryItems = page.locator('#position-demo-gallery .position-demo-item');
        const firstItem = galleryItems.first();

        // Check that overlay controls exist within the first gallery item
        const heartControl = firstItem.locator('[data-pswp-control-type="heart"]');
        const thumbsUpControl = firstItem.locator('[data-pswp-control-type="thumbs-up"]');
        const thumbsDownControl = firstItem.locator('[data-pswp-control-type="thumbs-down"]');
        const shareControl = firstItem.locator('[data-pswp-control-type="share"]');

        await expect(heartControl).toBeVisible();
        await expect(thumbsUpControl).toBeVisible();
        await expect(thumbsDownControl).toBeVisible();
        await expect(shareControl).toBeVisible();

        // Verify controls are positioned with spacing (they should have different computed positions)
        const heartBox = await heartControl.boundingBox();
        const thumbsUpBox = await thumbsUpControl.boundingBox();
        const shareBox = await shareControl.boundingBox();

        // Controls should not overlap completely (allowing for some pixel tolerance)
        const heartCenter = { x: heartBox.x + heartBox.width/2, y: heartBox.y + heartBox.height/2 };
        const thumbsUpCenter = { x: thumbsUpBox.x + thumbsUpBox.width/2, y: thumbsUpBox.y + thumbsUpBox.height/2 };
        const shareCenter = { x: shareBox.x + shareBox.width/2, y: shareBox.y + shareBox.height/2 };

        // Assert controls are spaced apart (at least 20px difference in position)
        const heartThumbsDistance = Math.abs(heartCenter.x - thumbsUpCenter.x) + Math.abs(heartCenter.y - thumbsUpCenter.y);
        const heartShareDistance = Math.abs(heartCenter.x - shareCenter.x) + Math.abs(heartCenter.y - shareCenter.y);

        expect(heartThumbsDistance).toBeGreaterThan(20);
        expect(heartShareDistance).toBeGreaterThan(20);

        console.log(`Heart center: (${heartCenter.x}, ${heartCenter.y})`);
        console.log(`ThumbsUp center: (${thumbsUpCenter.x}, ${thumbsUpCenter.y})`);
        console.log(`Share center: (${shareCenter.x}, ${shareCenter.y})`);
        console.log(`Heart-ThumbsUp distance: ${heartThumbsDistance}px`);
        console.log(`Heart-Share distance: ${heartShareDistance}px`);
    });

    test('should handle different grow directions', async ({ page }) => {
        // Set controls to same position
        await page.getByRole('radio', { name: 'Top Right' }).first().check(); // Heart
        await page.getByRole('radio', { name: 'Top Right' }).nth(1).check(); // Thumbs

        // Test Right grow direction (default)
        await expect(page.getByRole('radio', { name: 'Right →' })).toBeChecked();

        // Wait for state update
        await page.waitForTimeout(500);

        // Capture control positions with Right direction
        const galleryItem = page.locator('#position-demo-gallery .position-demo-item').first();
        const heartControl = galleryItem.locator('[data-pswp-control-type="heart"]');
        const thumbsUpControl = galleryItem.locator('[data-pswp-control-type="thumbs-up"]');

        const heartBoxRight = await heartControl.boundingBox();
        const thumbsUpBoxRight = await thumbsUpControl.boundingBox();

        // Change to Left grow direction
        await page.getByRole('radio', { name: '← Left' }).check();
        await page.waitForTimeout(500);

        // Capture new positions
        const heartBoxLeft = await heartControl.boundingBox();
        const thumbsUpBoxLeft = await thumbsUpControl.boundingBox();

        // Controls should have moved when grow direction changed
        const heartMoved = Math.abs(heartBoxRight.x - heartBoxLeft.x) > 5;
        const thumbsUpMoved = Math.abs(thumbsUpBoxRight.x - thumbsUpBoxLeft.x) > 5;

        expect(heartMoved || thumbsUpMoved).toBe(true);

        console.log(`Right direction - Heart: (${heartBoxRight.x}, ${heartBoxRight.y}), ThumbsUp: (${thumbsUpBoxRight.x}, ${thumbsUpBoxRight.y})`);
        console.log(`Left direction - Heart: (${heartBoxLeft.x}, ${heartBoxLeft.y}), ThumbsUp: (${thumbsUpBoxLeft.x}, ${thumbsUpBoxLeft.y})`);
    });

    test('should maintain functionality while using spacing system', async ({ page }) => {
        // Set controls to same position to test spacing
        await page.getByRole('radio', { name: 'Top Left' }).first().check(); // Heart
        await page.getByRole('radio', { name: 'Top Left' }).nth(1).check(); // Thumbs

        await page.waitForTimeout(500);

        // Test that heart control still works with spacing
        const galleryItem = page.locator('#position-demo-gallery .position-demo-item').first();
        const heartControl = galleryItem.locator('[data-pswp-control-type="heart"] button');

        // Verify initial heart state (should be inactive - black heart)
        await expect(heartControl).toContainText('🖤');

        // Click heart control
        await heartControl.click();

        // Verify heart becomes active (red heart)
        await expect(heartControl).toContainText('❤️');

        // Verify rating summary updates
        await expect(page.getByText('📊 Rating Summary')).toBeVisible();
        await expect(page.getByText('Favorites:')).toBeVisible();
        await expect(page.getByText('1')).toBeVisible(); // Should show 1 favorite
    });

    test('should work with thumbs up/down exclusive selection in spacing system', async ({ page }) => {
        // Set thumbs controls to same position as share
        await page.getByRole('radio', { name: 'Top Right' }).nth(1).check(); // Thumbs position
        await page.getByRole('radio', { name: 'Top Right' }).nth(2).check(); // Share position

        await page.waitForTimeout(500);

        const galleryItem = page.locator('#position-demo-gallery .position-demo-item').first();
        const thumbsUpControl = galleryItem.locator('[data-pswp-control-type="thumbs-up"] button');
        const thumbsDownControl = galleryItem.locator('[data-pswp-control-type="thumbs-down"] button');

        // Click thumbs up
        await thumbsUpControl.click();

        // Verify thumbs up is active and rating summary shows it
        await expect(page.getByText('Likes:')).toBeVisible();
        await expect(page.getByText('1')).toBeVisible();

        // Click thumbs down (should remove thumbs up due to exclusive selection)
        await thumbsDownControl.click();

        // Verify thumbs down is active and thumbs up is removed
        await expect(page.getByText('Dislikes:')).toBeVisible();
        await expect(page.getByText('Likes:')).not.toBeVisible();
    });
});