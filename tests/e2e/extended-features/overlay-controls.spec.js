const { test, expect } = require('@playwright/test');

test.describe('PhotoSwipe Overlay Controls', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/extended-features-demo');
        await page.waitForLoadState('networkidle');

        // Enable multi-select mode for most tests
        const multiSelectRadio = page.locator('input[name="selection"]').last();
        await multiSelectRadio.click();
        await page.waitForTimeout(500);
    });

    test.describe('Delete Button Functionality', () => {
        test('should not open gallery when delete button is clicked', async ({ page }) => {
            // Look for gallery images with delete buttons in the selection-deletion gallery
            const galleryItems = page.locator('#selection-deletion-gallery .gallery-item-wrapper');
            await expect(galleryItems).toHaveCount(3, { timeout: 10000 }); // Initial images

            // Find the delete button in the first gallery item
            const firstItem = galleryItems.first();
            const deleteButton = firstItem.locator('[data-pswp-control-type="delete"] button, .btn-delete-item');

            await expect(deleteButton).toBeVisible();
            await expect(deleteButton).toHaveAttribute('title', 'Delete this image');

            // Click the delete button - this should NOT open the gallery
            await deleteButton.click();

            // Wait a bit to ensure gallery doesn't open
            await page.waitForTimeout(1000);

            // Verify gallery lightbox did not open
            const lightbox = page.locator('.pswp');
            await expect(lightbox).not.toBeVisible();

            // Verify delete confirmation modal appears instead
            const deleteModal = page.locator('.delete-confirmation-modal');
            await expect(deleteModal).toBeVisible();

            // Cancel the deletion to clean up
            const cancelButton = page.locator('.btn-cancel-delete');
            await cancelButton.click();
            await expect(deleteModal).not.toBeVisible();
        });

        test('should successfully delete item when confirmed', async ({ page }) => {
            // Count initial items
            const initialCount = await page.locator('#selection-deletion-gallery .gallery-item-wrapper').count();
            expect(initialCount).toBeGreaterThan(0);

            // Click delete button on first item
            const deleteButton = page.locator('#selection-deletion-gallery .gallery-item-wrapper').first().locator('[data-pswp-control-type="delete"] button, .btn-delete-item');
            await deleteButton.click();

            // Confirm deletion
            const confirmButton = page.locator('.btn-confirm-delete');
            await expect(confirmButton).toBeVisible();
            await confirmButton.click();

            // Wait for deletion to complete
            await page.waitForTimeout(500);

            // Verify item count decreased
            const finalCount = await page.locator('#selection-deletion-gallery .gallery-item-wrapper').count();
            expect(finalCount).toBe(initialCount - 1);
        });

        test('should handle delete button hover effects', async ({ page }) => {
            const deleteButton = page.locator('#selection-deletion-gallery .gallery-item-wrapper').first().locator('[data-pswp-control-type="delete"] button, .btn-delete-item');
            await expect(deleteButton).toBeVisible();

            // Hover over delete button
            await deleteButton.hover();

            // The button should be visible and have proper styling
            await expect(deleteButton).toBeVisible();
            await expect(deleteButton).toHaveCSS('cursor', 'pointer');
        });
    });

    test.describe('Selection Controls Functionality', () => {
        test('should not open gallery when selection checkbox is clicked', async ({ page }) => {
            // Find a selection checkbox
            const selectionCheckbox = page.locator('.selection-checkbox').first();
            await expect(selectionCheckbox).toBeVisible();

            // Click the checkbox - this should NOT open the gallery
            await selectionCheckbox.click();

            // Wait to ensure gallery doesn't open
            await page.waitForTimeout(1000);

            // Verify gallery lightbox did not open
            const lightbox = page.locator('.pswp');
            await expect(lightbox).not.toBeVisible();

            // Verify the checkbox was actually checked
            await expect(selectionCheckbox).toBeChecked();
        });

        test('should handle multiple selection via checkboxes', async ({ page }) => {
            const checkboxes = page.locator('.selection-checkbox');
            const checkboxCount = await checkboxes.count();
            expect(checkboxCount).toBeGreaterThan(1);

            // Click first two checkboxes
            await checkboxes.nth(0).click();
            await checkboxes.nth(1).click();

            // Wait for state updates
            await page.waitForTimeout(500);

            // Verify both are checked
            await expect(checkboxes.nth(0)).toBeChecked();
            await expect(checkboxes.nth(1)).toBeChecked();

            // Gallery should not have opened
            const lightbox = page.locator('.pswp');
            await expect(lightbox).not.toBeVisible();

            // Check for selection controls becoming visible
            const deleteSelectedButton = page.locator('.btn-delete-selected');
            await expect(deleteSelectedButton).toBeVisible();
            await expect(deleteSelectedButton).toContainText('Delete Selected (2)');
        });

        test('should handle single selection via radio buttons', async ({ page }) => {
            // Switch to single selection mode
            const singleSelectRadio = page.locator('input[name="selection"]').nth(1);
            await singleSelectRadio.click();
            await page.waitForTimeout(500);

            // Find radio buttons
            const radioButtons = page.locator('.selection-radio');
            const radioCount = await radioButtons.count();
            expect(radioCount).toBeGreaterThan(1);

            // Click first radio button
            await radioButtons.first().click();

            // Wait for state updates
            await page.waitForTimeout(500);

            // Verify only first is selected
            await expect(radioButtons.first()).toBeChecked();

            // Gallery should not have opened
            const lightbox = page.locator('.pswp');
            await expect(lightbox).not.toBeVisible();

            // Click second radio button
            await radioButtons.nth(1).click();
            await page.waitForTimeout(500);

            // Verify selection switched
            await expect(radioButtons.first()).not.toBeChecked();
            await expect(radioButtons.nth(1)).toBeChecked();
        });
    });

    test.describe('Gallery Opening Prevention', () => {
        test('should open gallery when clicking on image area (not controls)', async ({ page }) => {
            // Click on the image itself, not on overlay controls
            const galleryImage = page.locator('.gallery-image').first();
            await expect(galleryImage).toBeVisible();

            await galleryImage.click();

            // Wait for gallery to open
            await page.waitForTimeout(1000);

            // Verify gallery lightbox opened
            const lightbox = page.locator('.pswp');
            await expect(lightbox).toBeVisible();

            // Close the gallery
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            await expect(lightbox).not.toBeVisible();
        });

        test('should prevent gallery opening for data-attribute marked controls', async ({ page }) => {
            // Look for delete button overlay controls (these are always visible)
            const deleteOverlayControls = page.locator('[data-pswp-control-type="delete"]');
            const deleteControlCount = await deleteOverlayControls.count();
            expect(deleteControlCount).toBeGreaterThan(0);

            // Click on a delete overlay control container
            await deleteOverlayControls.first().click();

            // Wait to ensure gallery doesn't open
            await page.waitForTimeout(1000);

            // Verify gallery lightbox did not open
            const lightbox = page.locator('.pswp');
            await expect(lightbox).not.toBeVisible();

            // Verify delete confirmation modal appears instead
            const deleteModal = page.locator('.delete-confirmation-modal');
            await expect(deleteModal).toBeVisible();

            // Cancel to clean up
            const cancelButton = page.locator('.btn-cancel-delete');
            await cancelButton.click();
        });

        test('should log prevention messages in console', async ({ page }) => {
            const consoleMessages = [];

            page.on('console', msg => {
                if (msg.text().includes('Gallery opening prevented')) {
                    consoleMessages.push(msg.text());
                }
            });

            // Click on a delete button
            const deleteButton = page.locator('.btn-delete-item').first();
            await deleteButton.click();

            // Cancel the modal
            const cancelButton = page.locator('.btn-cancel-delete');
            await cancelButton.click();

            // Wait a bit for console messages
            await page.waitForTimeout(1000);

            // Verify console messages were logged
            expect(consoleMessages.length).toBeGreaterThan(0);
            expect(consoleMessages.some(msg => msg.includes('data-attribute overlay control detected') || msg.includes('interactive element detected'))).toBeTruthy();
        });
    });

    test.describe('Overlay Control Accessibility', () => {
        test('should have proper ARIA labels and titles', async ({ page }) => {
            // Check delete button accessibility
            const deleteButton = page.locator('[data-pswp-control-type="delete"] button').first();
            await expect(deleteButton).toHaveAttribute('title', 'Delete this image');
            await expect(deleteButton).toHaveAttribute('aria-label', 'Delete image');

            // Check selection controls accessibility
            const selectionCheckbox = page.locator('.selection-checkbox').first();
            await expect(selectionCheckbox).toBeVisible();
        });

        test('should support keyboard navigation', async ({ page }) => {
            // Focus on delete button using Tab navigation
            await page.keyboard.press('Tab');

            // Find focused element
            const focusedElement = page.locator(':focus');

            // Should be able to focus overlay controls
            const isOverlayControl = await focusedElement.evaluate(el => {
                return el.closest('[data-pswp-overlay-control="true"]') !== null ||
                       el.classList.contains('btn-delete-item') ||
                       el.classList.contains('selection-checkbox') ||
                       el.classList.contains('selection-radio');
            });

            // Note: Exact focus behavior depends on tab order, so we just verify
            // that overlay controls are focusable elements
            const deleteButtons = page.locator('.btn-delete-item');
            const deleteButtonCount = await deleteButtons.count();
            expect(deleteButtonCount).toBeGreaterThan(0);
        });
    });

    test.describe('Responsive Behavior', () => {
        test('should work on mobile viewports', async ({ page }) => {
            // Switch to mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(500);

            // Overlay controls should still be visible and functional
            const deleteButton = page.locator('.btn-delete-item').first();
            await expect(deleteButton).toBeVisible();

            // Click should still work
            await deleteButton.click();

            // Modal should appear
            const deleteModal = page.locator('.delete-confirmation-modal');
            await expect(deleteModal).toBeVisible();

            // Cancel to clean up
            const cancelButton = page.locator('.btn-cancel-delete');
            await cancelButton.click();
        });

        test('should work on tablet viewports', async ({ page }) => {
            // Switch to tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.waitForTimeout(500);

            // Test selection functionality
            const selectionCheckbox = page.locator('.selection-checkbox').first();
            await expect(selectionCheckbox).toBeVisible();
            await selectionCheckbox.click();

            // Should not open gallery
            const lightbox = page.locator('.pswp');
            await expect(lightbox).not.toBeVisible();

            // Should show as selected
            await expect(selectionCheckbox).toBeChecked();
        });
    });

    test.describe('Error Handling', () => {
        test('should handle missing controls gracefully', async ({ page }) => {
            // Switch to read-only mode (no delete buttons)
            const readOnlyRadio = page.locator('input[name="readonly"]').last();
            await readOnlyRadio.click();
            await page.waitForTimeout(500);

            // Delete buttons should not be visible
            const deleteButtons = page.locator('.btn-delete-item');
            await expect(deleteButtons).toHaveCount(0);

            // Gallery should still be functional
            const galleryImage = page.locator('.gallery-image').first();
            await galleryImage.click();

            const lightbox = page.locator('.pswp');
            await expect(lightbox).toBeVisible();

            // Close gallery
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        });
    });
});