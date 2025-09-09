// Test data and fixtures for PhotoSwipe tests

const testData = {
  urls: {
    home: '/',
    photoswipeDemo: '/photoswipe-demo',
  },
  
  expectedTitles: {
    home: 'Home',
    photoswipeDemo: /PhotoSwipe/,
  },
  
  selectors: {
    galleryImages: 'a[data-pswp-width]',
    lightbox: '.pswp',
    lightboxImage: '.pswp__img',
    closeButton: '[data-pswp-close]',
    nextButton: '[data-pswp-next]',
    prevButton: '[data-pswp-prev]',
  },
  
  timeouts: {
    short: 1000,
    medium: 5000,
    long: 10000,
  },
  
  // Test image data that should be available in the gallery
  sampleImages: [
    { width: 1024, height: 768 },
    { width: 800, height: 600 },
    { width: 1200, height: 800 },
  ],
};

module.exports = testData;