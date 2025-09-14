// Test data and fixtures for PhotoSwipe tests

const testData = {
  urls: {
    home: '/',
    vanillaJsDemo: '/vanilla-js-demo',
    basicPhotoswipeDemo: '/basic-photoswipe-demo',
    extendedFeaturesDemo: '/extended-features-demo',
    // Legacy aliases for backwards compatibility
    photoswipeDemo: '/basic-photoswipe-demo',
    photoswipeUploadDemo: '/extended-features-demo',
  },
  
  expectedTitles: {
    home: 'Home',
    vanillaJsDemo: /Vanilla JS/,
    basicPhotoswipeDemo: /Basic PhotoSwipe Demo/,
    extendedFeaturesDemo: /Extended Features Demo/,
    // Legacy aliases
    photoswipeDemo: /Basic PhotoSwipe Demo/,
    photoswipeUploadDemo: /Extended Features Demo/,
  },
  
  selectors: {
    galleryImages: 'a[data-pswp-width]',
    lightbox: '.pswp',
    lightboxImage: '.pswp__img',
    closeButton: '[data-pswp-close]',
    nextButton: '[data-pswp-next]',
    prevButton: '[data-pswp-prev]',
    uploadArea: '.upload-area',
    uploadGallery: '.photoswipe-upload-gallery',
    fileInput: 'input[type="file"]',
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