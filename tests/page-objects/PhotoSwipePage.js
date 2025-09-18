// Page Object Model for PhotoSwipe functionality
const { waitForBlazorPhotoSwipeInit, waitForLightboxOpen, waitForLightboxClose } = require('../utils/test-helpers');

class PhotoSwipePage {
  constructor(page) {
    this.page = page;
    this.galleryImages = page.locator('a[data-pswp-width]');
    this.lightbox = page.locator('.pswp');
    this.lightboxImage = page.locator('.pswp__img');
    this.closeButton = page.locator('.pswp__button--close');
    this.nextButton = page.locator('.pswp__button--arrow--next');
    this.prevButton = page.locator('.pswp__button--arrow--prev');
  }

  async goto() {
    await this.page.goto('/basic-photoswipe-demo');
    await waitForBlazorPhotoSwipeInit(this.page, 'a[data-pswp-width]', 4);
  }

  async openFirstImage() {
    await this.galleryImages.first().click();
    await waitForLightboxOpen(this.page);
  }

  async openImageAtIndex(index) {
    await this.galleryImages.nth(index).click();
    await waitForLightboxOpen(this.page);
  }

  async closeLightbox() {
    await waitForLightboxClose(this.page);
  }

  async navigateNext() {
    await this.nextButton.click();
    await this.page.waitForTimeout(300);
  }

  async navigatePrev() {
    await this.prevButton.click();
    await this.page.waitForTimeout(300);
  }

  async isLightboxOpen() {
    return await this.page.evaluate(() => {
      const lightbox = document.querySelector('.pswp.pswp--open');
      return lightbox !== null;
    });
  }

  async isLightboxClosed() {
    return await this.page.evaluate(() => {
      const lightbox = document.querySelector('.pswp.pswp--open');
      return lightbox === null;
    });
  }

  async getGalleryImageCount() {
    return await this.galleryImages.count();
  }

  async waitForLightboxAnimation() {
    await this.page.waitForTimeout(1000); // Wait for PhotoSwipe animations
  }
}

module.exports = PhotoSwipePage;