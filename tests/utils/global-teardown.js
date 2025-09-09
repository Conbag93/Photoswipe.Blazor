// Global teardown for Playwright tests
// This runs once after all tests complete

async function globalTeardown(config) {
  console.log('🧹 Starting global teardown for PhotoSwipe Playwright tests...');
  
  // Cleanup tasks can go here
  // For example: cleaning up test databases, stopping services, etc.
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;