// Test helper functions for PhotoSwipe tests

/**
 * Wait for PhotoSwipe to be fully loaded and initialized
 * @param {import('@playwright/test').Page} page
 */
async function waitForPhotoSwipeReady(page) {
  await page.waitForFunction(() => {
    return window.PhotoSwipe && window.PhotoSwipeLightbox;
  }, { timeout: 10000 });
}

/**
 * Wait for Blazor components to render and PhotoSwipe galleries to initialize
 * @param {import('@playwright/test').Page} page
 * @param {string} gallerySelector - Selector for gallery images (e.g., 'a[data-pswp-width]')
 * @param {number} expectedCount - Expected minimum number of gallery images
 */
async function waitForBlazorPhotoSwipeInit(page, gallerySelector = 'a[data-pswp-width]', expectedCount = 1) {
  // Wait for Blazor to finish loading
  await page.waitForLoadState('networkidle');

  // Wait for PhotoSwipe wrapper to load
  await page.waitForFunction(() => {
    return document.querySelector('script[src*="photoswipe-simple.js"]') !== null ||
           document.querySelector('script[src*="_content/PhotoSwipe.Blazor"]') !== null;
  }, { timeout: 15000 });

  // Wait for gallery containers to be present
  await page.waitForFunction(() => {
    return document.querySelectorAll('[id*="photoswipe"]').length > 0;
  }, { timeout: 10000 });

  // Wait for gallery images to be rendered with data attributes
  await page.waitForFunction(([selector, minCount]) => {
    const images = document.querySelectorAll(selector);
    return images.length >= minCount &&
           Array.from(images).every(img =>
             img.hasAttribute('data-pswp-width') &&
             img.hasAttribute('data-pswp-height')
           );
  }, [gallerySelector, expectedCount], { timeout: 10000 });

  // Wait for PhotoSwipe initialization console logs (indicates components are ready)
  await page.waitForFunction(() => {
    return document.querySelectorAll('[id*="photoswipe"]').length > 0 &&
           document.querySelectorAll('a[data-pswp-width]').length > 0;
  }, { timeout: 5000 });

  // Small additional wait to ensure event handlers are attached
  await page.waitForTimeout(500);
}

/**
 * Wait for PhotoSwipe lightbox to open properly
 * @param {import('@playwright/test').Page} page
 */
async function waitForLightboxOpen(page) {
  await page.waitForSelector('.pswp.pswp--open', { state: 'visible', timeout: 5000 });

  // Wait for image to load in lightbox
  await page.waitForFunction(() => {
    const img = document.querySelector('.pswp__img');
    return img && (img.complete || img.naturalWidth > 0);
  }, { timeout: 10000 });
}

/**
 * Wait for PhotoSwipe lightbox to close properly
 * @param {import('@playwright/test').Page} page
 */
async function waitForLightboxClose(page) {
  // Try multiple strategies to close the lightbox
  try {
    // First, check if lightbox is actually open
    const isOpen = await page.evaluate(() => {
      const lightbox = document.querySelector('.pswp.pswp--open');
      return lightbox !== null;
    });

    if (!isOpen) {
      return; // Already closed
    }

    // Try Escape key first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Check if closed after Escape
    const stillOpen = await page.evaluate(() => {
      const lightbox = document.querySelector('.pswp.pswp--open');
      return lightbox !== null;
    });

    if (!stillOpen) {
      return; // Successfully closed
    }

    // Try clicking background area
    await page.click('.pswp__bg', { force: true });
    await page.waitForTimeout(500);

    // Final wait with shorter timeout
    await page.waitForFunction(() => {
      const lightbox = document.querySelector('.pswp');
      return !lightbox || !lightbox.classList.contains('pswp--open');
    }, { timeout: 3000 });
  } catch (error) {
    // If we still can't close it, try to force close by evaluating PhotoSwipe close method
    await page.evaluate(() => {
      const lightbox = document.querySelector('.pswp');
      if (lightbox && lightbox.classList.contains('pswp--open')) {
        // Try to find and trigger PhotoSwipe close
        const closeBtn = document.querySelector('[data-pswp-close]');
        if (closeBtn) {
          closeBtn.click();
        }
      }
    });
    await page.waitForTimeout(1000);
  }
}

/**
 * Take a screenshot with descriptive name
 * @param {import('@playwright/test').Page} page 
 * @param {string} name 
 */
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Check if an element is visible with custom timeout
 * @param {import('@playwright/test').Locator} locator 
 * @param {number} timeout 
 */
async function isVisibleWithTimeout(locator, timeout = 5000) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get viewport dimensions
 * @param {import('@playwright/test').Page} page 
 */
async function getViewportSize(page) {
  return await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));
}

/**
 * Simulate mobile swipe gesture
 * @param {import('@playwright/test').Page} page 
 * @param {string} direction - 'left' or 'right'
 */
async function swipe(page, direction) {
  const viewport = await getViewportSize(page);
  const startX = direction === 'left' ? viewport.width * 0.8 : viewport.width * 0.2;
  const endX = direction === 'left' ? viewport.width * 0.2 : viewport.width * 0.8;
  const y = viewport.height * 0.5;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
}

/**
 * Check console for errors
 * @param {import('@playwright/test').Page} page 
 */
async function getConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

module.exports = {
  waitForPhotoSwipeReady,
  waitForBlazorPhotoSwipeInit,
  waitForLightboxOpen,
  waitForLightboxClose,
  takeScreenshot,
  isVisibleWithTimeout,
  getViewportSize,
  swipe,
  getConsoleErrors,
};