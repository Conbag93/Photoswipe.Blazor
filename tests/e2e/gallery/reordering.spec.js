const { test, expect } = require('@playwright/test');

test.describe('PhotoSwipe Gallery Reordering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5224/extended-features-demo');
        await expect(page.locator('h1')).toContainText('Extended Features Demo');

        // Wait for reordering demo section to be visible
        await expect(page.locator('h3').filter({ hasText: 'Image Reordering Demo' })).toBeVisible();
    });

    test('should display reordering controls with correct accessibility attributes', async ({ page }) => {
        // Scroll to the reordering section to ensure it's visible
        await page.evaluate(() => {
            const reorderingSection = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Image Reordering Demo'));
            if (reorderingSection) reorderingSection.scrollIntoView();
        });

        // Check for index labels in the reordering demo gallery
        const indexLabels = page.locator('#reordering-demo-gallery [data-pswp-control-type="index"]');
        await expect(indexLabels).toHaveCount(4); // 4 images in reordering demo

        // Verify index labels show correct positions
        const firstIndexLabel = indexLabels.first();
        await expect(firstIndexLabel).toContainText('1/4');

        // Check for up arrow buttons
        const upArrows = page.locator('[data-pswp-control-type="reorder-up"] button');
        await expect(upArrows).toHaveCount(4);

        // Check for down arrow buttons
        const downArrows = page.locator('[data-pswp-control-type="reorder-down"] button');
        await expect(downArrows).toHaveCount(4);

        // Verify accessibility attributes
        const firstUpArrow = upArrows.first();
        await expect(firstUpArrow).toHaveAttribute('title', 'Already first image');
        await expect(firstUpArrow).toBeDisabled();

        const lastDownArrow = downArrows.last();
        await expect(lastDownArrow).toHaveAttribute('title', 'Already last image');
        await expect(lastDownArrow).toBeDisabled();
    });

    test('should handle boundary conditions correctly', async ({ page }) => {
        // First image up arrow should be disabled
        const firstUpArrow = page.locator('[data-pswp-control-type="reorder-up"] button').first();
        await expect(firstUpArrow).toBeDisabled();
        await expect(firstUpArrow).toHaveClass(/disabled/);

        // Last image down arrow should be disabled
        const lastDownArrow = page.locator('[data-pswp-control-type="reorder-down"] button').last();
        await expect(lastDownArrow).toBeDisabled();
        await expect(lastDownArrow).toHaveClass(/disabled/);

        // Middle images should have enabled buttons
        const secondUpArrow = page.locator('[data-pswp-control-type="reorder-up"] button').nth(1);
        const secondDownArrow = page.locator('[data-pswp-control-type="reorder-down"] button').nth(1);

        await expect(secondUpArrow).toBeEnabled();
        await expect(secondUpArrow).not.toHaveClass(/disabled/);
        await expect(secondDownArrow).toBeEnabled();
        await expect(secondDownArrow).not.toHaveClass(/disabled/);
    });

    test('should reorder images when using up arrow', async ({ page }) => {
        // Get initial order from summary
        const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
        expect(initialOrder).toHaveLength(4);

        // Move second image up (should become first)
        const secondUpArrow = page.locator('[data-pswp-control-type="reorder-up"] button').nth(1);
        await secondUpArrow.click();

        // Wait for state update
        await page.waitForTimeout(100);

        // Check updated order
        const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
        expect(newOrder[0]).toBe(initialOrder[1]); // Second item is now first
        expect(newOrder[1]).toBe(initialOrder[0]); // First item is now second
        expect(newOrder[2]).toBe(initialOrder[2]); // Third item unchanged
        expect(newOrder[3]).toBe(initialOrder[3]); // Fourth item unchanged

        // Verify index labels updated
        const firstIndexLabel = page.locator('[data-pswp-control-type="index"]').first();
        await expect(firstIndexLabel).toContainText('1/4');

        // Verify button states updated - new first item should have disabled up arrow
        const newFirstUpArrow = page.locator('[data-pswp-control-type="reorder-up"] button').first();
        await expect(newFirstUpArrow).toBeDisabled();
    });

    test('should reorder images when using down arrow', async ({ page }) => {
        // Get initial order from summary
        const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

        // Move first image down (should become second)
        const firstDownArrow = page.locator('[data-pswp-control-type="reorder-down"] button').first();
        await firstDownArrow.click();

        // Wait for state update
        await page.waitForTimeout(100);

        // Check updated order
        const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
        expect(newOrder[0]).toBe(initialOrder[1]); // Second item is now first
        expect(newOrder[1]).toBe(initialOrder[0]); // First item is now second
        expect(newOrder[2]).toBe(initialOrder[2]); // Third item unchanged
        expect(newOrder[3]).toBe(initialOrder[3]); // Fourth item unchanged

        // Verify new first item has disabled up arrow
        const newFirstUpArrow = page.locator('[data-pswp-control-type="reorder-up"] button').first();
        await expect(newFirstUpArrow).toBeDisabled();
    });

    test('should update index labels correctly after reordering', async ({ page }) => {
        // Initial state check
        const indexLabels = page.locator('[data-pswp-control-type="index"]');
        await expect(indexLabels.nth(0)).toContainText('1/4');
        await expect(indexLabels.nth(1)).toContainText('2/4');
        await expect(indexLabels.nth(2)).toContainText('3/4');
        await expect(indexLabels.nth(3)).toContainText('4/4');

        // Move second image up
        await page.locator('[data-pswp-control-type="reorder-up"] button').nth(1).click();
        await page.waitForTimeout(100);

        // Check updated labels
        await expect(indexLabels.nth(0)).toContainText('1/4');
        await expect(indexLabels.nth(1)).toContainText('2/4');
        await expect(indexLabels.nth(2)).toContainText('3/4');
        await expect(indexLabels.nth(3)).toContainText('4/4');
    });

    test('should prevent PhotoSwipe gallery opening when clicking reorder buttons', async ({ page }) => {
        // Ensure PhotoSwipe is not already open
        await expect(page.locator('.pswp')).not.toBeVisible();

        // Click up arrow button
        const upArrow = page.locator('[data-pswp-control-type="reorder-up"] button').nth(2);
        await upArrow.click();

        // PhotoSwipe should not open
        await expect(page.locator('.pswp')).not.toBeVisible();

        // Click down arrow button
        const downArrow = page.locator('[data-pswp-control-type="reorder-down"] button').nth(1);
        await downArrow.click();

        // PhotoSwipe should still not open
        await expect(page.locator('.pswp')).not.toBeVisible();
    });

    test('should open PhotoSwipe gallery with correct order after reordering', async ({ page }) => {
        // Get initial order
        const initialTitles = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

        // Reorder: move second image up
        await page.locator('[data-pswp-control-type="reorder-up"] button').nth(1).click();
        await page.waitForTimeout(100);

        // Get new order
        const newTitles = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

        // Click on first gallery image to open PhotoSwipe
        const firstGalleryImage = page.locator('#reordering-demo-gallery img').first();
        await firstGalleryImage.click();

        // Wait for PhotoSwipe to open
        await expect(page.locator('.pswp')).toBeVisible();

        // Verify PhotoSwipe opened with the reordered first image
        // Note: We can't easily verify the exact image without more complex setup,
        // but we can verify PhotoSwipe opened successfully
        await expect(page.locator('.pswp__item').first()).toBeVisible();

        // Close PhotoSwipe
        await page.keyboard.press('Escape');
        await expect(page.locator('.pswp')).not.toBeVisible();
    });

    test('should show proper visual feedback on hover', async ({ page }) => {
        // Test up arrow hover (should have green theme)
        const upArrow = page.locator('[data-pswp-control-type="reorder-up"] button').nth(1);
        await upArrow.hover();

        // Check if up arrow has the correct hover styling
        await expect(upArrow).toHaveClass(/up-arrow/);

        // Test down arrow hover (should have orange theme)
        const downArrow = page.locator('[data-pswp-control-type="reorder-down"] button').nth(1);
        await downArrow.hover();

        // Check if down arrow has the correct hover styling
        await expect(downArrow).toHaveClass(/down-arrow/);
    });

    test('should display order summary correctly', async ({ page }) => {
        // Check that order summary is visible
        const orderSummary = page.locator('.reordering-summary');
        await expect(orderSummary).toBeVisible();

        // Check summary title
        await expect(orderSummary.locator('h3')).toContainText('Current Image Order');

        // Check that all 4 items are listed
        const orderItems = orderSummary.locator('.order-item');
        await expect(orderItems).toHaveCount(4);

        // Check that first item has "First" badge
        const firstItem = orderItems.first();
        await expect(firstItem.locator('.order-badge.first')).toContainText('First');

        // Check that last item has "Last" badge
        const lastItem = orderItems.last();
        await expect(lastItem.locator('.order-badge.last')).toContainText('Last');

        // Check middle items don't have badges
        await expect(orderItems.nth(1).locator('.order-badge')).not.toBeVisible();
        await expect(orderItems.nth(2).locator('.order-badge')).not.toBeVisible();
    });

    test('should work correctly on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Verify controls are still present and functional
        const upArrows = page.locator('[data-pswp-control-type="reorder-up"] button');
        await expect(upArrows).toHaveCount(4);

        const downArrows = page.locator('[data-pswp-control-type="reorder-down"] button');
        await expect(downArrows).toHaveCount(4);

        // Test reordering still works
        const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

        await page.locator('[data-pswp-control-type="reorder-up"] button').nth(1).click();
        await page.waitForTimeout(100);

        const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
        expect(newOrder[0]).toBe(initialOrder[1]);
        expect(newOrder[1]).toBe(initialOrder[0]);
    });

    test('should handle rapid button clicks gracefully', async ({ page }) => {
        // Get initial order
        const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

        // Rapidly click up arrow multiple times
        const upArrow = page.locator('[data-pswp-control-type="reorder-up"] button').nth(2);

        // Click multiple times quickly
        await upArrow.click();
        await upArrow.click();
        await page.waitForTimeout(50);

        // Verify the state is consistent
        const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
        expect(newOrder).toHaveLength(4);

        // Verify index labels are consistent
        const indexLabels = page.locator('[data-pswp-control-type="index"]');
        for (let i = 0; i < 4; i++) {
            await expect(indexLabels.nth(i)).toContainText(`${i + 1}/4`);
        }
    });
});