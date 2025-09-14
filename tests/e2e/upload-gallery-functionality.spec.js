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
        // Check that mode controls are visible
        const modeControls = page.locator('.mode-controls').first();
        await expect(modeControls).toBeVisible();
        
        // Check for mode selection options
        await expect(page.locator('input[type="radio"]')).toHaveCount(6); // 3 sections x 2 options each
    });

    test('should display gallery section', async ({ page }) => {
        // Check for gallery container
        const gallery = page.locator('.gallery-section').first();
        await expect(gallery).toBeVisible();
        
        // Should have PhotoSwipeUploadGallery component
        const uploadGallery = page.locator('.photoswipe-upload-gallery');
        await expect(uploadGallery).toBeVisible();
    });

    test('should toggle between modes', async ({ page }) => {
        // Test readonly mode toggle
        const readOnlyRadio = page.locator('input[name="readonly"]').last();
        await readOnlyRadio.click();
        
        // Wait for state to update
        await page.waitForTimeout(500);
        
        // Switch back to interactive
        const interactiveRadio = page.locator('input[name="readonly"]').first();
        await interactiveRadio.click();
        await page.waitForTimeout(500);
    });

    test('should display workflow section when uploads enabled', async ({ page }) => {
        // Ensure uploads are enabled and not in read-only mode
        const uploadsCheckbox = page.locator('input[type="checkbox"]');
        if (await uploadsCheckbox.isChecked() === false) {
            await uploadsCheckbox.click();
        }
        
        const workflowSection = page.locator('.workflow-section');
        await expect(workflowSection).toBeVisible();
        
        // Should have action buttons
        const actionButtons = page.locator('.btn-action');
        const buttonCount = await actionButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
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
            const uploadArea = page.locator('.upload-area').first();
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
            const lightboxImage = page.locator('.pswp__img');
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
        
        // Check if selection controls appear
        const selectionControls = page.locator('.selection-controls');
        await expect(selectionControls).toBeVisible();
        
        // Look for select all button
        const selectAllBtn = page.locator('.btn-select-all');
        if (await selectAllBtn.count() > 0) {
            await expect(selectAllBtn).toBeVisible();
        }
    });

    // Removed selection controls tests - not present in current implementation
    // Removed checkbox tests - not present in current implementation
});