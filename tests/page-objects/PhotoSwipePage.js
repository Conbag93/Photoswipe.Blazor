// Page Object Model for PhotoSwipe functionality

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
    await this.page.waitForLoadState('networkidle');
  }

  async openFirstImage() {
    await this.galleryImages.first().click();
    await this.page.waitForTimeout(500); // Allow time for animation
  }

  async openImageAtIndex(index) {
    await this.galleryImages.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async closeLightbox() {
    if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
    } else {
      // Fallback: press Escape key
      await this.page.keyboard.press('Escape');
    }
    await this.page.waitForTimeout(500);
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
    return await this.lightbox.isVisible();
  }

  async isLightboxClosed() {
    return !(await this.lightbox.isVisible());
  }

  async getGalleryImageCount() {
    return await this.galleryImages.count();
  }

  async waitForLightboxAnimation() {
    await this.page.waitForTimeout(1000); // Wait for PhotoSwipe animations
  }
}

module.exports = PhotoSwipePage;