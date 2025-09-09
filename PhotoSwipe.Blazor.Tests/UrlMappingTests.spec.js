const { test, expect } = require('@playwright/test');

test.describe('PhotoSwipe URL Mapping Critical Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5224/photoswipe-demo');
    await page.waitForLoadState('networkidle');
  });

  const expectedImages = [
    { index: 0, url: 'https://picsum.photos/1200/800?random=1', alt: 'Random landscape photo 1' },
    { index: 1, url: 'https://picsum.photos/800/1200?random=2', alt: 'Random portrait photo 2' },
    { index: 2, url: 'https://picsum.photos/1000/600?random=3', alt: 'Random nature photo 3' },
    { index: 3, url: 'https://picsum.photos/1400/900?random=4', alt: 'Random photo 4' },
    { index: 4, url: 'https://picsum.photos/900/1200?random=5', alt: 'Random photo 5' },
    { index: 5, url: 'https://picsum.photos/1100/700?random=6', alt: 'Random photo 6' }
  ];

  test('CRITICAL: Click URL must match displayed modal image URL', async ({ page }) => {
    const results = [];
    
    for (const expected of expectedImages) {
      console.log(`\n🧪 Testing image ${expected.index}: ${expected.alt}`);
      
      // Click on the specific image
      await page.getByRole('link', { name: expected.alt }).first().click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]');
      
      // Capture console logs for this click
      const logs = [];
      page.on('console', msg => {
        if (msg.text().includes('CLICK HANDLER:') || msg.text().includes('ACTUAL:')) {
          logs.push(msg.text());
        }
      });
      
      // Check what image is actually displayed
      const modalCounter = await page.textContent('[role="dialog"] .pswp__counter');
      const expectedPosition = `${expected.index + 1} / 6`;
      
      // Get the actual image element in modal
      const modalImage = await page.locator('[role="dialog"] img').getAttribute('alt');
      
      const result = {
        clickedIndex: expected.index,
        clickedUrl: expected.url,
        clickedAlt: expected.alt,
        modalPosition: modalCounter,
        expectedPosition: expectedPosition,
        modalImageAlt: modalImage,
        correctPosition: modalCounter === expectedPosition,
        correctImage: modalImage === expected.alt
      };
      
      results.push(result);
      
      console.log(`   Clicked: ${expected.alt} (index ${expected.index})`);
      console.log(`   Modal shows: ${modalCounter} | Expected: ${expectedPosition}`);
      console.log(`   Modal image: ${modalImage}`);
      console.log(`   ✓ Position correct: ${result.correctPosition}`);
      console.log(`   ✓ Image correct: ${result.correctImage}`);
      
      // Close modal before next test
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Analyze results
    console.log('\n📊 TEST RESULTS SUMMARY:');
    const failures = results.filter(r => !r.correctPosition || !r.correctImage);
    const successes = results.filter(r => r.correctPosition && r.correctImage);
    
    console.log(`✅ Passed: ${successes.length}/${results.length}`);
    console.log(`❌ Failed: ${failures.length}/${results.length}`);
    
    if (failures.length > 0) {
      console.log('\n❌ FAILURES:');
      failures.forEach(f => {
        console.log(`   Clicked: ${f.clickedAlt} (index ${f.clickedIndex})`);
        console.log(`   Expected: ${f.expectedPosition} with ${f.clickedAlt}`);
        console.log(`   Actual: ${f.modalPosition} with ${f.modalImageAlt}`);
        console.log('');
      });
    }
    
    // Assert that ALL clicks show correct images
    expect(failures.length).toBe(0);
    expect(successes.length).toBe(6);
  });

  test('CRITICAL: Verify click handler index vs PhotoSwipe display index', async ({ page }) => {
    const consoleMessages = [];
    
    page.on('console', msg => {
      if (msg.text().includes('CLICK HANDLER:') || 
          msg.text().includes('REQUESTING:') || 
          msg.text().includes('ACTUAL:')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Test clicking on image 3 (index 2)
    console.log('\n🧪 Testing image 3 click (index 2)...');
    await page.getByRole('link', { name: 'Random nature photo 3' }).first().click();
    await page.waitForSelector('[role="dialog"]');
    
    // Wait for all console messages
    await page.waitForTimeout(1000);
    
    // Check modal position
    const modalCounter = await page.textContent('[role="dialog"] .pswp__counter');
    const modalImage = await page.locator('[role="dialog"] img').getAttribute('alt');
    
    console.log('Console messages:');
    consoleMessages.forEach(msg => console.log(`   ${msg}`));
    
    console.log(`\nModal shows: ${modalCounter}`);
    console.log(`Modal image: ${modalImage}`);
    
    // This should be "3 / 6" and "Random nature photo 3"
    expect(modalCounter).toBe('3 / 6');
    expect(modalImage).toBe('Random nature photo 3');
    
    await page.keyboard.press('Escape');
  });

  test('CRITICAL: All gallery types must work correctly', async ({ page }) => {
    const galleryTypes = [
      { selector: '[data-testid="basic-gallery"]', name: 'Basic Gallery' },
      { selector: '[data-testid="custom-template-gallery"]', name: 'Custom Template Gallery' },
      { selector: '[data-testid="events-gallery"]', name: 'Events Gallery' }
    ];
    
    for (const gallery of galleryTypes) {
      console.log(`\n🧪 Testing ${gallery.name}...`);
      
      // Test clicking first and third images in each gallery
      const testImages = [0, 2]; // Test index 0 and 2
      
      for (const imageIndex of testImages) {
        const imageLink = await page.locator(`${gallery.selector} a`).nth(imageIndex);
        const imageAlt = await imageLink.locator('img').getAttribute('alt');
        
        console.log(`   Clicking: ${imageAlt} (index ${imageIndex})`);
        
        await imageLink.click();
        await page.waitForSelector('[role="dialog"]');
        
        const modalCounter = await page.textContent('[role="dialog"] .pswp__counter');
        const expectedPosition = `${imageIndex + 1} / 6`;
        
        console.log(`   Expected: ${expectedPosition} | Actual: ${modalCounter}`);
        
        expect(modalCounter).toBe(expectedPosition);
        
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
  });
});