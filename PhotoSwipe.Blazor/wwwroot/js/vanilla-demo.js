// Vanilla JavaScript PhotoSwipe Demos
import PhotoSwipeLightbox from './photoswipe-lightbox.esm.min.js';
import PhotoSwipe from './photoswipe.esm.min.js';

let lightboxInstances = [];

export function initializeVanillaDemos() {
    console.log('Initializing PhotoSwipe vanilla JS demos...');
    
    // Demo 1: Basic Gallery with DOM Elements
    initBasicGallery();
    
    // Demo 2: Gallery from Data Array
    initArrayGallery();
    
    // Demo 3: Individual Images
    initIndividualImages();
    
    // Demo 4: Responsive Images
    initResponsiveGallery();
    
    // Demo 5: Mixed Content
    initMixedContent();
    
    // Demo 6: Custom Thumbnails
    initCustomThumbnails();
    
    // Demo 7: Dynamic Gallery
    initDynamicGallery();
    
    // Demo 8: Gallery with Captions
    initCaptionGallery();
}

function initBasicGallery() {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-basic',
        children: 'a',
        pswpModule: () => import('./photoswipe.esm.min.js')
    });
    lightbox.init();
    lightboxInstances.push(lightbox);
    console.log('✅ Basic gallery initialized');
}

function initArrayGallery() {
    const dataSource = [
        {
            src: 'https://dummyimage.com/1620x1080/4a90e2/fff/?text=Slide+1',
            width: 1620,
            height: 1080,
            alt: 'Test image 1'
        },
        {
            src: 'https://dummyimage.com/1950x1300/e74c3c/fff/?text=Slide+2',
            width: 1950,
            height: 1300,
            alt: 'Test image 2'
        },
        {
            srcset: 'https://dummyimage.com/1500x1000/27ae60/fff/?text=1500x1000 1500w, https://dummyimage.com/1200x800/27ae60/fff/?text=1200x800 1200w',
            src: 'https://dummyimage.com/1500x1000/27ae60/fff/?text=Responsive+Slide+3',
            width: 1500,
            height: 1000,
            alt: 'Test image 3'
        }
    ];
    
    const options = {
        dataSource: dataSource,
        pswpModule: () => import('./photoswipe.esm.min.js')
    };
    
    const lightbox = new PhotoSwipeLightbox(options);
    lightbox.init();
    lightboxInstances.push(lightbox);
    
    document.querySelector('#btn-array-gallery').addEventListener('click', () => {
        lightbox.loadAndOpen(0);
    });
    
    console.log('✅ Array gallery initialized');
}

function initIndividualImages() {
    const images = document.querySelectorAll('#gallery-individual a');
    images.forEach((element, index) => {
        const lightbox = new PhotoSwipeLightbox({
            gallery: element,
            pswpModule: () => import('./photoswipe.esm.min.js')
        });
        lightbox.init();
        lightboxInstances.push(lightbox);
    });
    console.log('✅ Individual images initialized');
}

function initResponsiveGallery() {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-responsive',
        children: 'a',
        pswpModule: () => import('./photoswipe.esm.min.js')
    });
    lightbox.init();
    lightboxInstances.push(lightbox);
    console.log('✅ Responsive gallery initialized');
}

function initMixedContent() {
    const mixedData = [
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/1/img-2500.jpg',
            width: 1875,
            height: 2500,
            alt: 'Beach photo'
        },
        {
            html: '<div class="custom-html-slide">🎨 Custom HTML Slide<br><br>This is a custom HTML content slide with <a href="https://photoswipe.com" target="_blank">a link to PhotoSwipe</a></div>'
        },
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/2/img-2500.jpg',
            width: 1669,
            height: 2500,
            alt: 'Stairs photo'
        },
        {
            html: '<div class="custom-html-slide">📊 Another HTML Slide<br><br>You can add any HTML content here, including charts, videos, or interactive elements!</div>'
        }
    ];
    
    const lightbox = new PhotoSwipeLightbox({
        dataSource: mixedData,
        pswpModule: () => import('./photoswipe.esm.min.js')
    });
    lightbox.init();
    lightboxInstances.push(lightbox);
    
    document.querySelector('#btn-mixed-content').addEventListener('click', () => {
        lightbox.loadAndOpen(0);
    });
    
    console.log('✅ Mixed content gallery initialized');
}

function initCustomThumbnails() {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-custom',
        children: 'a',
        pswpModule: () => import('./photoswipe.esm.min.js'),
        paddingFn: (viewportSize) => {
            return { top: 30, bottom: 30, left: 70, right: 70 };
        }
    });
    
    // Add zoom animation from thumbnail
    lightbox.on('firstUpdate', (e) => {
        const { pswp } = e;
        pswp.currSlide.zoomTo(1, { x: pswp.viewportSize.x / 2, y: pswp.viewportSize.y / 2 }, 333);
    });
    
    lightbox.init();
    lightboxInstances.push(lightbox);
    console.log('✅ Custom thumbnails gallery initialized');
}

function initDynamicGallery() {
    let dynamicLightbox = null;
    
    document.querySelector('#btn-dynamic-gallery').addEventListener('click', () => {
        const count = parseInt(document.querySelector('#dynamic-count').value) || 10;
        
        // Clean up previous instance
        if (dynamicLightbox) {
            dynamicLightbox.destroy();
        }
        
        dynamicLightbox = new PhotoSwipeLightbox({
            pswpModule: () => import('./photoswipe.esm.min.js'),
            preload: [1, 2]
        });
        
        dynamicLightbox.addFilter('numItems', () => count);
        
        dynamicLightbox.addFilter('itemData', (itemData, index) => {
            const colors = ['3498db', 'e74c3c', '2ecc71', 'f39c12', '9b59b6', '1abc9c'];
            const color = colors[index % colors.length];
            return {
                src: `https://dummyimage.com/800x600/${color}/fff/?text=Dynamic+Image+${index + 1}`,
                width: 800,
                height: 600,
                alt: `Dynamic image ${index + 1}`
            };
        });
        
        dynamicLightbox.init();
        dynamicLightbox.loadAndOpen(0);
        
        lightboxInstances.push(dynamicLightbox);
    });
    
    console.log('✅ Dynamic gallery initialized');
}

function initCaptionGallery() {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-caption',
        children: 'a',
        pswpModule: () => import('./photoswipe.esm.min.js')
    });
    
    // Add caption element
    lightbox.on('uiRegister', function() {
        lightbox.pswp.ui.registerElement({
            name: 'caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: 'Caption text',
            onInit: (el, pswp) => {
                lightbox.pswp.on('change', () => {
                    const currSlideData = lightbox.pswp.currSlide.data;
                    el.innerHTML = currSlideData.caption || '';
                });
            }
        });
    });
    
    lightbox.init();
    lightboxInstances.push(lightbox);
    console.log('✅ Caption gallery initialized');
}

export function cleanup() {
    console.log('Cleaning up PhotoSwipe instances...');
    lightboxInstances.forEach(instance => {
        try {
            if (instance && instance.destroy) {
                instance.destroy();
            }
        } catch (e) {
            console.warn('Error destroying instance:', e);
        }
    });
    lightboxInstances = [];
    console.log('✅ Cleanup complete');
}