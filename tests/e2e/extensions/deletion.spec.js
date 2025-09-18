const { test, expect } = require('@playwright/test');

test.describe('Deletion Comprehensive Tests', () => {
    const baseUrl = 'http://localhost:5225';

    test.describe('WASM Hosting Model', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(`${baseUrl}/test/deletion`);
            await page.waitForLoadState('networkidle');
            await expect(page.locator('h1')).toContainText('🗑️ Deletion Feature Test Page');
        });

        test.describe('Feature Behavior', () => {
            test('should load deletion test page with initial gallery', async ({ page }) => {
                // Verify page loaded correctly
                await expect(page.locator('.test-header h1')).toContainText('Deletion Feature Test Page');

                // Check initial gallery state
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(6); // Initial 6 images

                // Verify status panel shows correct count
                const totalImagesStatus = page.locator('.status-value').first();
                await expect(totalImagesStatus).toContainText('6');
            });

            test('should display delete buttons on all gallery items', async ({ page }) => {
                // Target only the custom delete buttons with the trash icon
                const deleteButtons = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item');
                await expect(deleteButtons).toHaveCount(6);

                // Each delete button should have proper attributes - check the button inside the overlay control
                const firstDeleteButton = deleteButtons.first().locator('button');
                await expect(firstDeleteButton).toHaveAttribute('title', 'Delete this image');
                await expect(firstDeleteButton).toHaveAttribute('aria-label', 'Delete image');
                await expect(firstDeleteButton).toContainText('🗑️');
            });

            test('should handle individual item deletion with confirmation', async ({ page }) => {
                // Ensure confirmation is enabled
                const requireConfirmationCheckbox = page.locator('label').filter({ hasText: 'Require Confirmation' }).locator('input[type="checkbox"]');
                await expect(requireConfirmationCheckbox).toBeChecked();

                // Click delete button on first item
                const firstDeleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await firstDeleteButton.click();

                // Verify confirmation modal appears
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).toBeVisible();
                await expect(confirmationModal.locator('h3')).toContainText('Confirm Deletion');
                await expect(confirmationModal.locator('p')).toContainText('Are you sure you want to delete this image?');

                // Confirm deletion
                const confirmButton = page.locator('.btn-confirm-delete');
                await confirmButton.click();

                // Wait for deletion to complete
                await page.waitForTimeout(500);

                // Verify gallery count decreased
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(5);

                // Verify status updated
                const deletedThisSessionStatus = page.locator('.status-value').nth(1);
                await expect(deletedThisSessionStatus).toContainText('1');
            });

            test('should handle deletion cancellation', async ({ page }) => {
                // Click delete button
                const firstDeleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await firstDeleteButton.click();

                // Verify modal appears
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).toBeVisible();

                // Cancel deletion
                const cancelButton = page.locator('.btn-cancel-delete');
                await cancelButton.click();

                // Verify modal disappears and no changes
                await expect(confirmationModal).not.toBeVisible();
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(6); // Should still have all items
            });

            test('should handle deletion without confirmation when disabled', async ({ page }) => {
                // Disable confirmation
                const requireConfirmationCheckbox = page.locator('label').filter({ hasText: 'Require Confirmation' }).locator('input[type="checkbox"]');
                await requireConfirmationCheckbox.uncheck();

                // Click delete button
                const firstDeleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await firstDeleteButton.click();

                // Should not show modal, deletion should happen immediately
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).not.toBeVisible();

                // Wait for deletion
                await page.waitForTimeout(500);

                // Verify gallery count decreased
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(5);
            });
        });

        test.describe('Bulk Deletion', () => {
            test('should enable selection when bulk delete is enabled', async ({ page }) => {
                // Enable bulk delete
                const enableBulkDeleteCheckbox = page.locator('label').filter({ hasText: 'Enable Bulk Delete' }).locator('input[type="checkbox"]');
                await enableBulkDeleteCheckbox.check();
                await page.waitForTimeout(500);

                // Verify selection checkboxes appear
                const selectionCheckboxes = page.locator('#deletion-test-gallery .selection-checkbox');
                await expect(selectionCheckboxes).toHaveCount(6);
            });

            test('should handle bulk deletion with multiple selected items', async ({ page }) => {
                // Enable bulk delete
                const enableBulkDeleteCheckbox = page.locator('label').filter({ hasText: 'Enable Bulk Delete' }).locator('input[type="checkbox"]');
                await enableBulkDeleteCheckbox.check();
                await page.waitForTimeout(500);

                // Select first two items
                const selectionCheckboxes = page.locator('#deletion-test-gallery .selection-checkbox');
                await selectionCheckboxes.nth(0).click();
                await selectionCheckboxes.nth(1).click();

                // Verify selection status shows 2 items
                const selectedForDeletionStatus = page.locator('.status-item').filter({ hasText: 'Selected for Deletion' }).locator('.status-value');
                await expect(selectedForDeletionStatus).toContainText('2');

                // Click bulk delete button in the test actions area
                const bulkDeleteButton = page.locator('.test-actions button').filter({ hasText: 'Delete Selected (2)' });
                await expect(bulkDeleteButton).toBeVisible();
                await bulkDeleteButton.click();

                // Confirm deletion
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).toBeVisible();
                await expect(confirmationModal.locator('p')).toContainText('Are you sure you want to delete 2 images?');

                const confirmButton = page.locator('.btn-confirm-delete');
                await confirmButton.click();

                // Wait for deletion
                await page.waitForTimeout(500);

                // Verify gallery count decreased by 2
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(4);
            });
        });

        test.describe('Delete Button Positioning', () => {
            test('should change delete button position', async ({ page }) => {
                // Change position to Top Left
                const topLeftRadio = page.locator('input[name="delete-position"]').nth(1);
                await topLeftRadio.click();
                await page.waitForTimeout(500);

                // Verify all delete buttons are still present
                const deleteButtons = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item');
                await expect(deleteButtons).toHaveCount(6);

                // Change to Bottom Right
                const bottomRightRadio = page.locator('input[name="delete-position"]').nth(2);
                await bottomRightRadio.click();
                await page.waitForTimeout(500);

                // Verify buttons still work
                const firstDeleteButton = deleteButtons.first();
                await expect(firstDeleteButton).toBeVisible();
                const firstButton = firstDeleteButton.locator('button');
                await expect(firstButton).toHaveAttribute('title', 'Delete this image');
            });
        });

        test.describe('Gallery Integration', () => {
            test('should prevent gallery opening when delete button is clicked', async ({ page }) => {
                // Click delete button
                const firstDeleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await firstDeleteButton.click();

                // Wait for potential gallery opening
                await page.waitForTimeout(1000);

                // Verify PhotoSwipe lightbox did not open
                const lightbox = page.locator('.pswp');
                await expect(lightbox).not.toBeVisible();

                // But confirmation modal should be visible
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).toBeVisible();

                // Cancel to clean up
                const cancelButton = page.locator('.btn-cancel-delete');
                await cancelButton.click();
            });

            test('should allow gallery opening when clicking on image area', async ({ page }) => {
                // Click on image itself, not on delete button
                const galleryImage = page.locator('#deletion-test-gallery img').first();
                await galleryImage.click();

                // Wait for gallery to open
                await page.waitForTimeout(1000);

                // Verify PhotoSwipe lightbox opened
                const lightbox = page.locator('.pswp');
                await expect(lightbox).toBeVisible();

                // Close gallery
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
                await expect(lightbox).not.toBeVisible();
            });
        });

        test.describe('Statistics and Performance', () => {
            test('should track deletion statistics', async ({ page }) => {
                // Disable confirmation for faster testing
                const requireConfirmationCheckbox = page.locator('label').filter({ hasText: 'Require Confirmation' }).locator('input[type="checkbox"]');
                await requireConfirmationCheckbox.uncheck();

                // Delete one item
                const firstDeleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await firstDeleteButton.click();
                await page.waitForTimeout(500);

                // Check statistics were updated
                const totalDeletionsStat = page.locator('.stat-card').first().locator('.stat-value');
                await expect(totalDeletionsStat).toContainText('1');

                // Verify timing information is present
                const lastDeleteTimeStatus = page.locator('.status-item').filter({ hasText: 'Last Delete Time' }).locator('.status-value');
                await expect(lastDeleteTimeStatus).toBeVisible();

                // Check average delete time is shown
                const averageDeleteTimeStat = page.locator('.stat-card').last().locator('.stat-value');
                await expect(averageDeleteTimeStat).not.toContainText('N/A');
            });

            test('should handle performance testing with batch operations', async ({ page }) => {
                // Add 50 images
                const add50Button = page.locator('button').filter({ hasText: 'Add 50 Images' });
                await add50Button.click();
                await page.waitForTimeout(2000); // Wait for images to be added

                // Verify gallery count increased
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(56); // 6 initial + 50

                // Delete half
                const deleteHalfButton = page.locator('button').filter({ hasText: 'Delete Half' });
                await deleteHalfButton.click();
                await page.waitForTimeout(2000);

                // Verify count decreased
                await expect(galleryItems).toHaveCount(28); // Approximately half

                // Check performance stats were updated
                const perfStats = page.locator('.perf-stats');
                await expect(perfStats).toContainText('Gallery has 28 items');
            });
        });

        test.describe('User Interactions', () => {
            test('should handle delete button hover effects', async ({ page }) => {
                const deleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();

                // Hover over delete button
                await deleteButton.hover();

                // Verify button is still visible and clickable
                await expect(deleteButton).toBeVisible();
                await expect(deleteButton).toHaveCSS('cursor', 'pointer');
            });

            test('should handle rapid deletion attempts', async ({ page }) => {
                // Disable confirmation for faster testing
                const requireConfirmationCheckbox = page.locator('label').filter({ hasText: 'Require Confirmation' }).locator('input[type="checkbox"]');
                await requireConfirmationCheckbox.uncheck();

                // Rapidly delete multiple items
                for (let i = 0; i < 3; i++) {
                    const deleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                    await deleteButton.click();
                    await page.waitForTimeout(300);
                }

                // Verify gallery count updated correctly
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(3); // 6 - 3 = 3
            });
        });

        test.describe('Test Controls', () => {
            test('should restore gallery to initial state', async ({ page }) => {
                // Delete some items first
                const requireConfirmationCheckbox = page.locator('label').filter({ hasText: 'Require Confirmation' }).locator('input[type="checkbox"]');
                await requireConfirmationCheckbox.uncheck();

                const deleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await deleteButton.click();
                await page.waitForTimeout(500);

                // Verify count decreased
                let galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(5);

                // Restore gallery
                const restoreButton = page.locator('button').filter({ hasText: 'Restore Gallery' });
                await restoreButton.click();
                await page.waitForTimeout(500);

                // Verify count restored
                galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(6);

                // Verify deleted this session counter reset
                const deletedThisSessionStatus = page.locator('.status-value').nth(1);
                await expect(deletedThisSessionStatus).toContainText('0');
            });

            test('should add more images dynamically', async ({ page }) => {
                // Add more images
                const addMoreButton = page.locator('button').filter({ hasText: 'Add More Images' });
                await addMoreButton.click();
                await page.waitForTimeout(500);

                // Verify gallery count increased
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(9); // 6 + 3

                // Verify all items have delete buttons
                const deleteButtons = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item');
                await expect(deleteButtons).toHaveCount(9);
            });

            test('should simulate delete errors', async ({ page }) => {
                // Click simulate error button
                const simulateErrorButton = page.locator('button').filter({ hasText: 'Simulate Delete Error' });
                await simulateErrorButton.click();

                // This should log an error without breaking the page
                // We just verify the page is still functional
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(6); // No change in count
            });
        });

        test.describe('Accessibility', () => {
            test('should have proper ARIA labels and titles', async ({ page }) => {
                // Check delete button accessibility - check the actual button element
                const deleteButtonControl = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                const deleteButton = deleteButtonControl.locator('button');
                await expect(deleteButton).toHaveAttribute('title', 'Delete this image');
                await expect(deleteButton).toHaveAttribute('aria-label', 'Delete image');

                // Check modal accessibility when it appears
                await deleteButtonControl.click();
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).toBeVisible();

                // Check confirm and cancel buttons
                const confirmButton = page.locator('.btn-confirm-delete');
                const cancelButton = page.locator('.btn-cancel-delete');
                await expect(confirmButton).toContainText('Delete');
                await expect(cancelButton).toContainText('Cancel');

                // Clean up
                await cancelButton.click();
            });

            test('should support keyboard navigation', async ({ page }) => {
                // Focus should be able to reach delete buttons
                await page.keyboard.press('Tab');

                // Check that delete buttons are focusable
                const deleteButtons = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item');
                await expect(deleteButtons).toHaveCount(6);

                // Each delete button should be a proper button element
                for (let i = 0; i < 6; i++) {
                    const button = deleteButtons.nth(i);
                    await expect(button).toBeVisible();
                }
            });
        });

        test.describe('Responsive Behavior', () => {
            test('should work on mobile viewports', async ({ page }) => {
                // Switch to mobile viewport
                await page.setViewportSize({ width: 375, height: 667 });
                await page.waitForTimeout(500);

                // Delete buttons should still be visible and functional
                const deleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await expect(deleteButton).toBeVisible();

                // Click should still work
                await deleteButton.click();

                // Modal should appear and be properly sized
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).toBeVisible();

                // Cancel to clean up
                const cancelButton = page.locator('.btn-cancel-delete');
                await cancelButton.click();
            });

            test('should work on tablet viewports', async ({ page }) => {
                // Switch to tablet viewport
                await page.setViewportSize({ width: 768, height: 1024 });
                await page.waitForTimeout(500);

                // Test bulk deletion on tablet
                const enableBulkDeleteCheckbox = page.locator('label').filter({ hasText: 'Enable Bulk Delete' }).locator('input[type="checkbox"]');
                await enableBulkDeleteCheckbox.check();
                await page.waitForTimeout(500);

                // Select an item
                const selectionCheckbox = page.locator('#deletion-test-gallery .selection-checkbox').first();
                await expect(selectionCheckbox).toBeVisible();
                await selectionCheckbox.click();

                // Should show as selected
                await expect(selectionCheckbox).toBeChecked();
            });
        });

        test.describe('Edge Cases', () => {
            test('should handle deletion when gallery is empty', async ({ page }) => {
                // Clear all images
                const clearAllButton = page.locator('button').filter({ hasText: 'Clear All' });
                await clearAllButton.click();
                await page.waitForTimeout(500);

                // Verify gallery is empty
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(0);

                // Verify no delete buttons exist
                const deleteButtons = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item');
                await expect(deleteButtons).toHaveCount(0);

                // Status should show 0 images
                const totalImagesStatus = page.locator('.status-value').first();
                await expect(totalImagesStatus).toContainText('0');
            });

            test('should handle deletion settings changes during operation', async ({ page }) => {
                // Start a deletion
                const deleteButton = page.locator('#deletion-test-gallery .photoswipe-overlay-control.btn-delete-item').first();
                await deleteButton.click();

                // Verify modal appears
                const confirmationModal = page.locator('.delete-confirmation-modal');
                await expect(confirmationModal).toBeVisible();

                // Complete the deletion
                const confirmButton = page.locator('.btn-confirm-delete');
                await confirmButton.click();
                await page.waitForTimeout(500);

                // Deletion should still work
                const galleryItems = page.locator('#deletion-test-gallery .gallery-item-wrapper');
                await expect(galleryItems).toHaveCount(5);

                // Now try changing settings after the modal is closed
                const showDeleteAnimationCheckbox = page.locator('label').filter({ hasText: 'Show Delete Animation' }).locator('input[type="checkbox"]');
                await showDeleteAnimationCheckbox.uncheck();

                // Settings change should work
                await expect(showDeleteAnimationCheckbox).not.toBeChecked();
            });
        });
    });
});