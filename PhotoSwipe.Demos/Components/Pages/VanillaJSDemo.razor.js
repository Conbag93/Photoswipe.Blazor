// VanillaJSDemo.razor.js - Vanilla JavaScript implementation following PhotoSwipe.com patterns

let lightboxInstances = [];

export async function initializePhotoSwipeDemos() {
    try {
        updateStatus('init-status', '🔄 Initializing...');
        console.log('🚀 Starting PhotoSwipe vanilla JS demos initialization...');

        // Import PhotoSwipe modules following official documentation patterns
        const { default: PhotoSwipeLightbox } = await import('/_content/PhotoSwipe.Blazor/js/photoswipe-lightbox.esm.min.js');
        
        // Clear any existing instances
        destroyAllInstances();
        lightboxInstances = [];

        // Demo 1: Basic DOM Gallery - following photoswipe.com example
        initBasicGallery(PhotoSwipeLightbox);
        
        // Demo 2: Individual Images - each with own instance
        initIndividualImages(PhotoSwipeLightbox);
        
        // Demo 3: Responsive Gallery
        initResponsiveGallery(PhotoSwipeLightbox);
        
        // Demo 4: Custom Thumbnails Gallery with advanced options
        initCustomGallery(PhotoSwipeLightbox);

        // Demo 5: Mixed Layout Gallery - PhotoSwipe.com homepage style
        initMixedLayoutGallery(PhotoSwipeLightbox);

        // Demo 6: Caption Gallery with custom UI elements
        initCaptionGallery(PhotoSwipeLightbox);
        
        // Demo 6: Array-based Gallery (button triggered)
        initArrayGallery(PhotoSwipeLightbox);
        
        // Demo 7: Mixed Content Gallery (button triggered)
        initMixedContentGallery(PhotoSwipeLightbox);
        
        // Demo 8: Dynamic Gallery Generator (button triggered)
        initDynamicGallery(PhotoSwipeLightbox);

        // Update status display
        updateStatus('init-status', '✅ Complete');
        updateStatus('active-demos', lightboxInstances.length.toString());
        
        console.log(`✅ PhotoSwipe vanilla JS demos initialized successfully! (${lightboxInstances.length} instances)`);
        
    } catch (error) {
        console.error('❌ Error initializing PhotoSwipe demos:', error);
        updateStatus('init-status', '❌ Failed');
        updateStatus('active-demos', '0');
        throw error;
    }
}

// Demo 1: Basic Gallery - Standard PhotoSwipe pattern from documentation
function initBasicGallery(PhotoSwipeLightbox) {
    const basicLightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-basic',
        children: 'a',
        pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
    });
    
    basicLightbox.init();
    lightboxInstances.push(basicLightbox);
    console.log('✅ Basic gallery initialized');
}

// Demo 2: Individual Images - Each image gets its own PhotoSwipe instance
function initIndividualImages(PhotoSwipeLightbox) {
    const individualImages = document.querySelectorAll('#gallery-individual a');
    
    individualImages.forEach((element, index) => {
        const lightbox = new PhotoSwipeLightbox({
            gallery: element,
            pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
        });
        
        lightbox.init();
        lightboxInstances.push(lightbox);
    });
    
    console.log(`✅ Individual images initialized (${individualImages.length} instances)`);
}

// Demo 3: Responsive Gallery with srcset support
function initResponsiveGallery(PhotoSwipeLightbox) {
    const responsiveLightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-responsive',
        children: 'a',
        pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
    });
    
    responsiveLightbox.init();
    lightboxInstances.push(responsiveLightbox);
    console.log('✅ Responsive gallery initialized');
}

// Demo 4: Custom Thumbnails with advanced PhotoSwipe options
function initCustomGallery(PhotoSwipeLightbox) {
    const customLightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-custom',
        children: 'a',
        pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js'),
        // Custom padding function as shown in PhotoSwipe docs
        paddingFn: (viewportSize) => {
            return { top: 30, bottom: 30, left: 70, right: 70 };
        }
    });
    
    // Add custom opening animation - proper PhotoSwipe event timing
    customLightbox.on('initialZoomInEnd', (e) => {
        // Add a subtle zoom effect after initial opening animation
        const { pswp } = e;
        if (pswp && pswp.currSlide) {
            // Optional: Add a small zoom bounce effect
            console.log('Custom thumbnails: Initial zoom completed');
        }
    });
    
    // Use proper opening transition settings
    customLightbox.on('beforeOpen', (e) => {
        // Customize the opening animation
        customLightbox.pswp.options.showAnimationDuration = 400;
        customLightbox.pswp.options.hideAnimationDuration = 400;
    });
    
    customLightbox.init();
    lightboxInstances.push(customLightbox);
    console.log('✅ Custom thumbnails gallery initialized');
}

// Demo 5: Mixed Layout Gallery - PhotoSwipe.com homepage style
function initMixedLayoutGallery(PhotoSwipeLightbox) {
    const mixedLayoutLightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-mixed-layout',
        children: 'a',
        pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
    });

    mixedLayoutLightbox.init();
    lightboxInstances.push(mixedLayoutLightbox);
    console.log('✅ Mixed layout gallery initialized');
}

// Demo 6: Caption Gallery with custom UI elements
function initCaptionGallery(PhotoSwipeLightbox) {
    const captionLightbox = new PhotoSwipeLightbox({
        gallery: '#gallery-caption',
        children: 'a',
        pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
    });
    
    // Add caption element following PhotoSwipe.com/caption/ pattern
    captionLightbox.on('uiRegister', function() {
        captionLightbox.pswp.ui.registerElement({
            name: 'custom-caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: '',
            onInit: (el, pswp) => {
                // Style the caption element
                el.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    padding: 20px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    color: white;
                    font-size: 16px;
                    line-height: 1.4;
                    pointer-events: none;
                    z-index: 100;
                `;
                
                // Function to update caption content
                const updateCaption = () => {
                    const currSlideData = pswp.currSlide?.data;
                    if (currSlideData) {
                        // Get caption from data-caption attribute or alt text
                        const captionText = currSlideData.caption || 
                                          currSlideData.alt || 
                                          currSlideData.msrc || '';
                        el.innerHTML = captionText;
                        el.style.display = captionText ? 'block' : 'none';
                    }
                };
                
                // Update caption on slide change
                pswp.on('change', updateCaption);
                
                // Update caption on first load
                pswp.on('afterInit', updateCaption);
            }
        });
    });
    
    captionLightbox.init();
    lightboxInstances.push(captionLightbox);
    console.log('✅ Caption gallery initialized');
}

// Demo 6: Array-based Gallery - PhotoSwipe dataSource pattern
function initArrayGallery(PhotoSwipeLightbox) {
    const arrayData = [
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/1/img-2500.jpg',
            width: 1875,
            height: 2500,
            alt: 'Beach landscape'
        },
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/2/img-2500.jpg',
            width: 1669,
            height: 2500,
            alt: 'Architectural stairs'
        },
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/3/img-2500.jpg',
            width: 2500,
            height: 1666,
            alt: 'Red chair'
        },
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/4/img-2500.jpg',
            width: 1875,
            height: 2500,
            alt: 'Mountain peak'
        },
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/5/img-2500.jpg',
            width: 2500,
            height: 1667,
            alt: 'Mountain landscape'
        }
    ];
    
    const arrayLightbox = new PhotoSwipeLightbox({
        dataSource: arrayData,
        pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
    });
    
    arrayLightbox.init();
    lightboxInstances.push(arrayLightbox);
    
    // Attach button event using standard DOM API
    const arrayButton = document.getElementById('btn-array-gallery');
    if (arrayButton) {
        arrayButton.addEventListener('click', () => {
            arrayLightbox.loadAndOpen(0);
        });
    }
    
    console.log('✅ Array gallery initialized');
}

// Demo 7: Mixed Content Gallery with HTML slides
function initMixedContentGallery(PhotoSwipeLightbox) {
    const mixedData = [
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/1/img-2500.jpg',
            width: 1875,
            height: 2500,
            alt: 'Beach photo'
        },
        {
            html: `<div class="custom-html-slide">
                🎨 Custom HTML Slide
                <br><br>
                This demonstrates PhotoSwipe's flexibility beyond just images!
                <br><br>
                <a href="https://photoswipe.com" target="_blank">Learn more at PhotoSwipe.com</a>
            </div>`,
            width: 800,
            height: 600
        },
        {
            src: 'https://cdn.photoswipe.com/photoswipe-demo-images/photos/2/img-2500.jpg',
            width: 1669,
            height: 2500,
            alt: 'Stairs photo'
        },
        {
            html: `<div class="custom-html-slide">
                📊 Another HTML Slide
                <br><br>
                Perfect for showcasing charts, text, or any custom content alongside images!
            </div>`,
            width: 800,
            height: 600
        }
    ];
    
    const mixedLightbox = new PhotoSwipeLightbox({
        dataSource: mixedData,
        pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
    });
    
    // Add custom content handling following PhotoSwipe.com/custom-content/ pattern
    mixedLightbox.on('contentLoad', (e) => {
        const { content, isLazy } = e;
        
        if (content.data.html && !content.element) {
            // Create HTML content element
            const htmlElement = document.createElement('div');
            htmlElement.innerHTML = content.data.html;
            htmlElement.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            `;
            
            content.element = htmlElement;
            
            // Prevent loading of non-existent image
            e.preventDefault();
        }
    });
    
    mixedLightbox.init();
    lightboxInstances.push(mixedLightbox);
    
    // Attach button event
    const mixedButton = document.getElementById('btn-mixed-content');
    if (mixedButton) {
        mixedButton.addEventListener('click', () => {
            mixedLightbox.loadAndOpen(0);
        });
    }
    
    console.log('✅ Mixed content gallery initialized');
}

// Demo 8: Dynamic Gallery using PhotoSwipe filters
function initDynamicGallery(PhotoSwipeLightbox) {
    const dynamicButton = document.getElementById('btn-dynamic-gallery');
    if (!dynamicButton) return;
    
    dynamicButton.addEventListener('click', () => {
        const countInput = document.getElementById('dynamic-count');
        const count = parseInt(countInput?.value) || 8;
        
        // Create a new PhotoSwipe instance with filters
        const dynamicLightbox = new PhotoSwipeLightbox({
            pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js'),
            preload: [1, 2]
        });
        
        // Use PhotoSwipe filters API for dynamic content
        dynamicLightbox.addFilter('numItems', () => count);
        
        dynamicLightbox.addFilter('itemData', (itemData, index) => {
            const colors = ['3498db', 'e74c3c', '2ecc71', 'f39c12', '9b59b6', '1abc9c', 'e67e22', '34495e'];
            const color = colors[index % colors.length];
            const size = Math.random() > 0.5 ? { width: 800, height: 600 } : { width: 600, height: 800 };
            
            return {
                src: `https://dummyimage.com/${size.width}x${size.height}/${color}/fff/?text=Dynamic+Image+${index + 1}`,
                width: size.width,
                height: size.height,
                alt: `Dynamic image ${index + 1}`
            };
        });
        
        dynamicLightbox.init();
        dynamicLightbox.loadAndOpen(0);
        
        // Add to instances for cleanup
        lightboxInstances.push(dynamicLightbox);
        
        // Update counter
        updateStatus('active-demos', lightboxInstances.length.toString());
    });
    
    console.log('✅ Dynamic gallery generator initialized');
}

// Utility function to update status display
function updateStatus(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Cleanup function to destroy all PhotoSwipe instances
export function destroyAllInstances() {
    if (lightboxInstances && lightboxInstances.length > 0) {
        lightboxInstances.forEach(instance => {
            try {
                if (instance && instance.destroy) {
                    instance.destroy();
                }
            } catch (e) {
                console.warn('Error destroying PhotoSwipe instance:', e);
            }
        });
        
        lightboxInstances = [];
        console.log('✅ PhotoSwipe instances cleaned up');
    }
}

// Export for global access if needed
window.photoswipeVanillaDemo = {
    initializePhotoSwipeDemos,
    destroyAllInstances
};