const { test, expect } = require('@playwright/test');

// Test URLs for both variants
const BLAZOR_SERVER_URL = 'http://localhost:5224';
const BLAZOR_WASM_URL = 'http://localhost:5225';

// Common test function for both variants
async function testPhotoSwipeVariant(page, baseUrl, variantName) {
  console.log(`Testing ${variantName} at ${baseUrl}`);

  // Navigate to home page
  await page.goto(baseUrl);

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Check page title contains PhotoSwipe
  await expect(page).toHaveTitle(/PhotoSwipe/);

  // Verify navigation links exist
  await expect(page.locator('text=Vanilla JS Demo')).toBeVisible();
  await expect(page.locator('text=Basic PhotoSwipe Demo')).toBeVisible();
  await expect(page.locator('text=Extended Features Demo')).toBeVisible();

  // Test navigation to Basic PhotoSwipe Demo
  await page.click('text=Basic PhotoSwipe Demo');
  await page.waitForLoadState('networkidle');

  // Check that demo content is loaded
  await expect(page.locator('text=Basic PhotoSwipe Components')).toBeVisible();
  await expect(page.locator('text=DOM Gallery')).toBeVisible();

  // Verify demo images are present
  const thumbnails = page.locator('img[alt*="Sample"]');
  await expect(thumbnails.first()).toBeVisible();

  // Test navigation to Extended Features Demo
  await page.click('text=Extended Features Demo');
  await page.waitForLoadState('networkidle');

  // Check that extended features are loaded
  await expect(page.locator('text=Selection & Deletion Demo')).toBeVisible();
  await expect(page.locator('text=Gallery Permissions')).toBeVisible();

  // Verify upload functionality UI is present
  await expect(page.locator('text=Allow Adding Images')).toBeVisible();
  await expect(page.locator('text=Allow Deleting Images')).toBeVisible();

  // Test navigation to Vanilla JS Demo
  await page.click('text=Vanilla JS Demo');
  await page.waitForLoadState('networkidle');

  // Check vanilla JS demo content
  await expect(page.locator('text=Vanilla JavaScript PhotoSwipe Integration')).toBeVisible();

  console.log(`✅ ${variantName} tests passed successfully`);
}

test.describe('PhotoSwipe Shared Demos', () => {
  test('Blazor Server variant uses shared demos correctly', async ({ page }) => {
    await testPhotoSwipeVariant(page, BLAZOR_SERVER_URL, 'Blazor Server');
  });

  test('Blazor WASM variant uses shared demos correctly', async ({ page }) => {
    await testPhotoSwipeVariant(page, BLAZOR_WASM_URL, 'Blazor WASM');
  });

  test('Both variants have identical demo content', async ({ browser }) => {
    // Create two pages to compare content
    const serverContext = await browser.newContext();
    const wasmContext = await browser.newContext();

    const serverPage = await serverContext.newPage();
    const wasmPage = await wasmContext.newPage();

    // Navigate both to the same demo page
    await serverPage.goto(`${BLAZOR_SERVER_URL}/basic-photoswipe-demo`);
    await wasmPage.goto(`${BLAZOR_WASM_URL}/basic-photoswipe-demo`);

    await serverPage.waitForLoadState('networkidle');
    await wasmPage.waitForLoadState('networkidle');

    // Check that key content is identical
    const serverTitle = await serverPage.locator('h1').first().textContent();
    const wasmTitle = await wasmPage.locator('h1').first().textContent();
    expect(serverTitle).toBe(wasmTitle);

    // Check that both have the same demo structure
    const serverDemos = await serverPage.locator('h2').allTextContents();
    const wasmDemos = await wasmPage.locator('h2').allTextContents();
    expect(serverDemos).toEqual(wasmDemos);

    await serverContext.close();
    await wasmContext.close();

    console.log('✅ Both variants have identical demo content structure');
  });
});