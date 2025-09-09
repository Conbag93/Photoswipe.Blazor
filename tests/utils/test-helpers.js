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
  takeScreenshot,
  isVisibleWithTimeout,
  getViewportSize,
  swipe,
  getConsoleErrors,
};