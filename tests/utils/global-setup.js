// Global setup for Playwright tests
// This runs once before all tests

async function globalSetup(config) {
  console.log('🔧 Starting global setup for PhotoSwipe Playwright tests...');
  
  // Check if the web server is running
  try {
    const response = await fetch(config.webServer.url);
    if (response.ok) {
      console.log('✅ PhotoSwipe sample app is running at', config.webServer.url);
    } else {
      console.warn('⚠️ PhotoSwipe app returned status:', response.status);
    }
  } catch (error) {
    console.error('❌ PhotoSwipe app is not running at', config.webServer.url);
    console.error('Please start the app with: cd PhotoSwipe.Sample && dotnet run');
    process.exit(1);
  }
  
  console.log('✅ Global setup completed');
}

module.exports = globalSetup;