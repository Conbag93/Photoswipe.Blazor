const { test, expect } = require('@playwright/test');

test.describe('PhotoSwipe Extended Features Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/extended-features-demo');
        await page.waitForLoadState('networkidle');
    });

    test('should display extended features page', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle(/Extended Features Demo/);
        
        // Check main heading exists
        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1);
        await expect(h1).toContainText('Extended Features Demo');
    });

    test('should display mode controls', async ({ page }) => {
        // Check that permission controls are visible (replaced readonly mode)
        const permissionControls = page.locator('label:has-text("Allow Adding Images")');
        await expect(permissionControls).toBeVisible();

        const deletePermission = page.locator('label:has-text("Allow Deleting Images")');
        await expect(deletePermission).toBeVisible();

        // Check for selection mode options
        const selectionMode = page.locator('input[name="selection"]');
        await expect(selectionMode).toHaveCount(3); // None, Single, Multi
    });

    test('should display gallery section', async ({ page }) => {
        // Check for gallery container in selection-deletion demo
        const gallery = page.locator('#selection-deletion-gallery');
        await expect(gallery).toBeVisible();

        // Should have gallery items
        const galleryItems = page.locator('#selection-deletion-gallery .gallery-item-wrapper');
        await expect(galleryItems).toHaveCount(3); // 3 initial images
    });

    test('should toggle between modes', async ({ page }) => {
        // Test selection mode toggle
        const singleRadio = page.locator('input[name="selection"]').nth(1);
        await singleRadio.click();

        // Wait for state to update
        await page.waitForTimeout(500);

        // Switch to multi selection
        const multiRadio = page.locator('input[name="selection"]').nth(2);
        await multiRadio.click();
        await page.waitForTimeout(500);
    });

    test('should display workflow section when uploads enabled', async ({ page }) => {
        // Check for upload area
        const uploadSection = page.locator('.upload-zone, .upload-area').first();
        await expect(uploadSection).toBeVisible();

        // Should have selection buttons
        const selectAllButton = page.locator('.btn-select-all');
        await expect(selectAllButton).toBeVisible();

        const deselectAllButton = page.locator('.btn-deselect-all');
        await expect(deselectAllButton).toBeVisible();
    });

    test('should handle responsive design', async ({ page }) => {
        // Test different viewport sizes
        const viewports = [
            { width: 1200, height: 800, name: 'desktop' },
            { width: 768, height: 600, name: 'tablet' },
            { width: 480, height: 600, name: 'mobile' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            
            // Main content should still be visible
            const mainContent = page.locator('main, article, [role="main"]').first();
            await expect(mainContent).toBeVisible();
            
            // Upload area should still be accessible
            const uploadArea = page.locator('.upload-zone, .upload-area').first();
            if (await uploadArea.count() > 0) {
                await expect(uploadArea).toBeVisible();
            }
        }
    });

    test('should open PhotoSwipe lightbox when clicking gallery images', async ({ page }) => {
        // Check if there are any existing gallery images to click
        const galleryImages = page.locator('a[data-pswp-width]');
        const imageCount = await galleryImages.count();
        
        if (imageCount > 0) {
            // Click the first gallery image
            await galleryImages.first().click();
            
            await page.waitForTimeout(1000); // Wait for PhotoSwipe animation
            
            // Check that PhotoSwipe lightbox opened
            const lightbox = page.locator('.pswp');
            await expect(lightbox).toBeVisible();
            
            // Check that lightbox contains an image
            const lightboxImage = page.locator('.pswp__img').first();
            await expect(lightboxImage).toBeVisible();
            
            // Close lightbox with Escape key
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Verify lightbox is closed
            await expect(lightbox).not.toBeVisible();
        } else {
            // Extended features demo should have initial images
            expect(imageCount).toBeGreaterThan(0);
        }
    });

    test('should test selection functionality', async ({ page }) => {
        // Enable multi-select mode
        const multiSelectRadio = page.locator('input[name="selection"]').last();
        await multiSelectRadio.click();
        await page.waitForTimeout(500);
        
        // Check if selection checkboxes appear
        const selectionCheckboxes = page.locator('#selection-deletion-gallery .selection-checkbox');
        await expect(selectionCheckboxes).toHaveCount(3);

        // Look for select all button
        const selectAllBtn = page.locator('.btn-select-all');
        await expect(selectAllBtn).toBeVisible();
    });

    // Removed selection controls tests - not present in current implementation
    // Removed checkbox tests - not present in current implementation
});