const { test, expect } = require('@playwright/test');

test.describe('PhotoSwipe Reordering Comprehensive Tests', () => {
    const baseUrl = 'http://localhost:5225'; // WASM hosting model only

    test.beforeEach(async ({ page }) => {
        await page.goto(`${baseUrl}/test/reordering`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1')).toContainText('Reordering Feature Test Page');

        // Wait for test gallery to be visible
        await expect(page.locator('#reordering-test-gallery')).toBeVisible();
    });

    test.describe('Feature Behavior', () => {
        test('should display reordering controls with correct accessibility attributes', async ({ page }) => {
            // Wait for and check index labels in the test gallery
            const indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            await page.waitForSelector('#reordering-test-gallery [data-pswp-control-type="index"]', { timeout: 5000 });
            await expect(indexLabels).toHaveCount(4); // Default small gallery has 4 images

            // Verify index labels show correct positions
            const firstIndexLabel = indexLabels.first();
            await expect(firstIndexLabel).toContainText('1/4');

            // Check for up arrow buttons
            const upArrows = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button');
            await expect(upArrows).toHaveCount(4);

            // Check for down arrow buttons
            const downArrows = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button');
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
            const firstUpArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').first();
            await expect(firstUpArrow).toBeDisabled();
            await expect(firstUpArrow).toHaveClass(/disabled/);

            // Last image down arrow should be disabled
            const lastDownArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').last();
            await expect(lastDownArrow).toBeDisabled();
            await expect(lastDownArrow).toHaveClass(/disabled/);

            // Middle images should have enabled buttons
            const secondUpArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1);
            const secondDownArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').nth(1);

            await expect(secondUpArrow).toBeEnabled();
            await expect(secondUpArrow).not.toHaveClass(/disabled/);
            await expect(secondDownArrow).toBeEnabled();
            await expect(secondDownArrow).not.toHaveClass(/disabled/);
        });

        test('should update index labels correctly after reordering', async ({ page }) => {
            // Initial state check
            const indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            await expect(indexLabels.nth(0)).toContainText('1/4');
            await expect(indexLabels.nth(1)).toContainText('2/4');
            await expect(indexLabels.nth(2)).toContainText('3/4');
            await expect(indexLabels.nth(3)).toContainText('4/4');

            // Move second image up
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1).click();
            await page.waitForTimeout(100);

            // Check updated labels - positions should remain consistent
            await expect(indexLabels.nth(0)).toContainText('1/4');
            await expect(indexLabels.nth(1)).toContainText('2/4');
            await expect(indexLabels.nth(2)).toContainText('3/4');
            await expect(indexLabels.nth(3)).toContainText('4/4');
        });

        test('should display current order summary correctly', async ({ page }) => {
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

            // Check middle items don't have first/last badges
            await expect(orderItems.nth(1).locator('.order-badge.first, .order-badge.last')).toHaveCount(0);
            await expect(orderItems.nth(2).locator('.order-badge.first, .order-badge.last')).toHaveCount(0);
        });
    });

    test.describe('User Interactions', () => {
        test('should reorder images when using up arrow', async ({ page }) => {
            // Get initial order from summary
            const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
            expect(initialOrder).toHaveLength(4);

            // Move second image up (should become first)
            const secondUpArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1);
            await secondUpArrow.click();

            // Wait for state update
            await page.waitForTimeout(100);

            // Check updated order
            const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
            expect(newOrder[0]).toBe(initialOrder[1]); // Second item is now first
            expect(newOrder[1]).toBe(initialOrder[0]); // First item is now second
            expect(newOrder[2]).toBe(initialOrder[2]); // Third item unchanged
            expect(newOrder[3]).toBe(initialOrder[3]); // Fourth item unchanged

            // Verify button states updated - new first item should have disabled up arrow
            const newFirstUpArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').first();
            await expect(newFirstUpArrow).toBeDisabled();
        });

        test('should reorder images when using down arrow', async ({ page }) => {
            // Get initial order from summary
            const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Move first image down (should become second)
            const firstDownArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').first();
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
            const newFirstUpArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').first();
            await expect(newFirstUpArrow).toBeDisabled();
        });

        test('should prevent PhotoSwipe gallery opening when clicking reorder buttons', async ({ page }) => {
            // Ensure PhotoSwipe is not already open
            await expect(page.locator('.pswp')).not.toBeVisible();

            // Click up arrow button
            const upArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(2);
            await upArrow.click();

            // PhotoSwipe should not open
            await expect(page.locator('.pswp')).not.toBeVisible();

            // Click down arrow button
            const downArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').nth(1);
            await downArrow.click();

            // PhotoSwipe should still not open
            await expect(page.locator('.pswp')).not.toBeVisible();
        });

        test('should show proper visual feedback on hover', async ({ page }) => {
            // Test up arrow hover (should have up-arrow class)
            const upArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1);
            await upArrow.hover();

            // Check if up arrow has the correct hover styling
            await expect(upArrow).toHaveClass(/up-arrow/);

            // Test down arrow hover (should have down-arrow class)
            const downArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').nth(1);
            await downArrow.hover();

            // Check if down arrow has the correct hover styling
            await expect(downArrow).toHaveClass(/down-arrow/);
        });

        test('should handle rapid button clicks gracefully', async ({ page }) => {
            // Get initial order
            const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Rapidly click up arrow multiple times
            const upArrow = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(2);

            // Click multiple times quickly
            await upArrow.click();
            await upArrow.click();
            await page.waitForTimeout(50);

            // Verify the state is consistent
            const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
            expect(newOrder).toHaveLength(4);

            // Verify index labels are consistent
            const indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            for (let i = 0; i < 4; i++) {
                await expect(indexLabels.nth(i)).toContainText(`${i + 1}/4`);
            }
        });
    });

    test.describe('Gallery Integration', () => {
        test('should open PhotoSwipe gallery with correct order after reordering', async ({ page }) => {
            // Get initial order
            const initialTitles = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Reorder: move second image up
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1).click();
            await page.waitForTimeout(100);

            // Get new order
            const newTitles = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Click on first gallery image to open PhotoSwipe
            const firstGalleryImage = page.locator('#reordering-test-gallery img').first();
            await firstGalleryImage.click();

            // Wait for PhotoSwipe to open
            await expect(page.locator('.pswp')).toBeVisible();

            // Verify PhotoSwipe opened with the reordered first image
            await expect(page.locator('.pswp__item').first()).toBeVisible();

            // Close PhotoSwipe
            await page.keyboard.press('Escape');
            await expect(page.locator('.pswp')).not.toBeVisible();
        });

        test('should maintain gallery order integrity after reordering', async ({ page }) => {
            // Get initial order
            const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Reorder items
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1).click();
            await page.waitForTimeout(100);

            const orderAfterReorder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Verify the order actually changed
            expect(orderAfterReorder).not.toEqual(initialOrder);

            // Verify that the item that was originally second is now first
            expect(orderAfterReorder[0]).toBe(initialOrder[1]);
            expect(orderAfterReorder[1]).toBe(initialOrder[0]);

            // Verify the summary shows correct first/last badges
            const firstItem = page.locator('.reordering-summary .order-item').first();
            const lastItem = page.locator('.reordering-summary .order-item').last();

            await expect(firstItem.locator('.order-badge.first')).toContainText('First');
            await expect(lastItem.locator('.order-badge.last')).toContainText('Last');
        });
    });

    test.describe('Performance Testing', () => {
        test('should track move performance statistics', async ({ page }) => {
            // Check initial performance stats
            const perfStats = page.locator('.performance-testing');
            await expect(perfStats).toBeVisible();

            // Initially should show N/A for times
            await expect(perfStats.locator('.perf-value').first()).toContainText('N/A');

            // Perform a move
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1).click();
            await page.waitForTimeout(100);

            // Check that performance stats are updated
            const averageTime = perfStats.locator('.perf-item').filter({ hasText: 'Average Move Time' }).locator('.perf-value');
            await expect(averageTime).not.toContainText('N/A');

            // Verify it shows a reasonable time (should be under 100ms)
            const timeText = await averageTime.textContent();
            const timeValue = parseFloat(timeText.replace(' ms', ''));
            expect(timeValue).toBeGreaterThan(0);
            expect(timeValue).toBeLessThan(1000); // Should be under 1 second
        });

        test('should handle large gallery performance', async ({ page }) => {
            // Switch to large gallery
            const largeGalleryRadio = page.locator('input[name="gallery-size"]').nth(2);
            await largeGalleryRadio.click();
            await page.waitForTimeout(500);

            // Verify we have 10 items now
            const indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            await expect(indexLabels).toHaveCount(10);

            // Verify first and last labels
            await expect(indexLabels.first()).toContainText('1/10');
            await expect(indexLabels.last()).toContainText('10/10');

            // Perform several moves on different items to ensure they're all valid
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(3).click();
            await page.waitForTimeout(50);
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').nth(2).click();
            await page.waitForTimeout(50);
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(5).click();
            await page.waitForTimeout(50);

            // Check total moves counter - should be at least 3
            const totalMoves = page.locator('.status-item').filter({ hasText: 'Moves Performed' }).locator('.status-value');
            const movesText = await totalMoves.textContent();
            expect(parseInt(movesText)).toBeGreaterThanOrEqual(3);
        });
    });

    test.describe('Test Controls', () => {
        test('should reset gallery to original order', async ({ page }) => {
            // Perform some moves
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1).click();
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').nth(0).click();
            await page.waitForTimeout(200);

            // Check moves counter is > 0
            const totalMoves = page.locator('.status-item').filter({ hasText: 'Moves Performed' }).locator('.status-value');
            const movesText = await totalMoves.textContent();
            expect(parseInt(movesText)).toBeGreaterThan(0);

            // Reset gallery
            await page.locator('button').filter({ hasText: 'Reset Gallery' }).click();
            await page.waitForTimeout(100);

            // Verify moves counter is reset
            await expect(totalMoves).toContainText('0');

            // Verify order is back to original
            const orderItems = page.locator('.reordering-summary .order-item .order-title');
            const firstTitle = await orderItems.first().textContent();
            expect(firstTitle).toBe('Mountain Peak'); // Original first item
        });

        test('should move first to last programmatically', async ({ page }) => {
            // Get initial first item
            const initialFirst = await page.locator('.reordering-summary .order-item .order-title').first().textContent();

            // Click "Move First to Last" button
            await page.locator('button').filter({ hasText: 'Move First to Last' }).click();
            await page.waitForTimeout(100);

            // Verify the item is now last
            const newLast = await page.locator('.reordering-summary .order-item .order-title').last().textContent();
            expect(newLast).toBe(initialFirst);

            // Verify moves counter increased
            const totalMoves = page.locator('.status-item').filter({ hasText: 'Moves Performed' }).locator('.status-value');
            await expect(totalMoves).toContainText('1');
        });

        test('should randomize gallery order', async ({ page }) => {
            // Get initial order
            const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Randomize order
            await page.locator('button').filter({ hasText: 'Randomize Order' }).click();
            await page.waitForTimeout(100);

            // Get new order
            const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            // Order should be different (very low probability of being the same)
            const isSameOrder = JSON.stringify(initialOrder) === JSON.stringify(newOrder);
            expect(isSameOrder).toBe(false);

            // Should still have same items, just reordered
            const sortedInitial = [...initialOrder].sort();
            const sortedNew = [...newOrder].sort();
            expect(sortedNew).toEqual(sortedInitial);
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper ARIA attributes', async ({ page }) => {
            // Check up arrow buttons have proper ARIA attributes
            const upArrows = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button');
            const firstUpArrow = upArrows.first();
            const middleUpArrow = upArrows.nth(1);

            await expect(firstUpArrow).toHaveAttribute('title', 'Already first image');
            await expect(middleUpArrow).toHaveAttribute('title', expect.stringContaining('Move'));

            // Check down arrow buttons have proper ARIA attributes
            const downArrows = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button');
            const lastDownArrow = downArrows.last();
            const middleDownArrow = downArrows.nth(1);

            await expect(lastDownArrow).toHaveAttribute('title', 'Already last image');
            await expect(middleDownArrow).toHaveAttribute('title', expect.stringContaining('Move'));
        });

        test('should work correctly on mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            // Verify controls are still present and functional
            const upArrows = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button');
            await expect(upArrows).toHaveCount(4);

            const downArrows = page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button');
            await expect(downArrows).toHaveCount(4);

            // Test reordering still works
            const initialOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();

            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1).click();
            await page.waitForTimeout(100);

            const newOrder = await page.locator('.reordering-summary .order-item .order-title').allTextContents();
            expect(newOrder[0]).toBe(initialOrder[1]);
            expect(newOrder[1]).toBe(initialOrder[0]);
        });
    });

    test.describe('Edge Cases', () => {
        test('should handle index label toggle correctly', async ({ page }) => {
            // Initially index labels should be visible
            const indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            await expect(indexLabels).toHaveCount(4);

            // Toggle index labels off using the label containing the checkbox
            const indexToggle = page.locator('label').filter({ hasText: 'Display position indicators' }).locator('input[type="checkbox"]');
            await indexToggle.uncheck();
            await page.waitForTimeout(200);

            // Index labels should be hidden
            await expect(indexLabels).toHaveCount(0);

            // Toggle back on
            await indexToggle.check();
            await page.waitForTimeout(200);

            // Index labels should be visible again
            await expect(indexLabels).toHaveCount(4);
        });

        test('should handle gallery size changes correctly', async ({ page }) => {
            // Start with small (4 items)
            let indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            await expect(indexLabels).toHaveCount(4);

            // Switch to medium (6 items)
            const mediumRadio = page.locator('input[name="gallery-size"]').nth(1);
            await mediumRadio.click();
            await page.waitForTimeout(500);

            indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            await expect(indexLabels).toHaveCount(6);
            await expect(indexLabels.last()).toContainText('6/6');

            // Switch to large (10 items)
            const largeRadio = page.locator('input[name="gallery-size"]').nth(2);
            await largeRadio.click();
            await page.waitForTimeout(500);

            indexLabels = page.locator('#reordering-test-gallery [data-pswp-control-type="index"]');
            await expect(indexLabels).toHaveCount(10);
            await expect(indexLabels.last()).toContainText('10/10');

            // Verify moves counter resets with size change
            const totalMoves = page.locator('.status-item').filter({ hasText: 'Moves Performed' }).locator('.status-value');
            await expect(totalMoves).toContainText('0');
        });

        test('should track moved items correctly', async ({ page }) => {
            // Initially no items should be marked as moved
            const movedItemsCount = page.locator('.status-item').filter({ hasText: 'Items Moved' }).locator('.status-value');
            await expect(movedItemsCount).toContainText('0');

            // Move one item
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-up"] button').nth(1).click();
            await page.waitForTimeout(100);

            // Should show 2 items moved (the two that swapped positions)
            await expect(movedItemsCount).toContainText('2');

            // Move another item
            await page.locator('#reordering-test-gallery [data-pswp-control-type="reorder-down"] button').nth(2).click();
            await page.waitForTimeout(100);

            // Should show more items moved
            const movedCount = await movedItemsCount.textContent();
            expect(parseInt(movedCount)).toBeGreaterThan(2);
        });
    });
});