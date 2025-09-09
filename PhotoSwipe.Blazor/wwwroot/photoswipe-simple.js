// ============================================================================
// PhotoSwipe Blazor Wrapper - SINGLE SOURCE OF TRUTH
// ============================================================================
// 
// ⚠️  IMPORTANT: This is THE ONLY JavaScript file used by PhotoSwipe Blazor components.
//     - Referenced by PhotoSwipeInterop.cs 
//     - Loaded automatically by Blazor applications using this library
//     - DO NOT create duplicate wrapper files - modify THIS file instead
//
// Purpose: Provides JavaScript interop for PhotoSwipe functionality in Blazor applications
// Dependencies: PhotoSwipe 5.x library files (photoswipe.esm.min.js, photoswipe-lightbox.esm.min.js)
// 
// Features:
// - DOM-based gallery initialization (PhotoSwipeGallery component)
// - Data-based gallery initialization (PhotoSwipeLightbox component)  
// - Caption support with custom UI elements
// - Event handlers for Blazor callbacks
// - Aspect ratio preservation through CSS fixes in photoswipe.css
//
// ============================================================================

window.PhotoSwipeBlazor = {
    instances: new Map(),

    // Create and initialize PhotoSwipe instance
    create: async function (elementId, options, dotnetInstance) {
        console.log(`🚀 PhotoSwipeBlazor.create called for element: ${elementId}`);
        
        // Find the gallery element
        const galleryElement = document.getElementById(elementId);
        if (!galleryElement) {
            console.error(`❌ Gallery element not found: ${elementId}`);
            throw new Error(`Gallery element not found: ${elementId}`);
        }

        try {
            // Import PhotoSwipe modules dynamically
            console.log('📦 Importing PhotoSwipe modules...');
            const { default: PhotoSwipeLightbox } = await import('/_content/PhotoSwipe.Blazor/js/photoswipe-lightbox.esm.min.js');
            
            // Create PhotoSwipe configuration - merge options first, then override essential settings
            const config = {
                ...(options || {}),
                gallery: `#${elementId}`,
                children: 'a', 
                pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js')
            };

            console.log('⚙️ PhotoSwipe config:', config);

            // Create PhotoSwipe Lightbox instance
            const lightbox = new PhotoSwipeLightbox(config);

            // Add custom caption UI element support (matching vanilla JS implementation)
            lightbox.on('uiRegister', function() {
                lightbox.pswp.ui.registerElement({
                    name: 'custom-caption',
                    order: 9,
                    isButton: false,
                    appendTo: 'root',
                    html: '',
                    onInit: (el, pswp) => {
                        // Style the caption element to match vanilla JS implementation
                        el.style.cssText = `
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            width: 100%;
                            padding: 20px;
                            background: linear-gradient(transparent, rgba(0,0,0,0.8));
                            color: white;
                            font-size: 16px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            line-height: 1.4;
                            box-sizing: border-box;
                            z-index: 1000;
                        `;
                        
                        // Function to update caption content - matching vanilla JS implementation
                        const updateCaption = () => {
                            const currSlideData = pswp.currSlide?.data;
                            if (currSlideData) {
                                // Get caption from data-caption attribute (PhotoSwipe maps this to .caption)
                                const captionText = currSlideData.caption || 
                                                  currSlideData.alt || '';
                                el.innerHTML = captionText;  // Use innerHTML to support HTML in captions
                                el.style.display = captionText ? 'block' : 'none';
                            }
                        };
                        
                        // Update caption when slide changes
                        pswp.on('change', updateCaption);
                        
                        // Set initial caption on first load
                        pswp.on('afterInit', updateCaption);
                    }
                });
            });

            // Add event handlers for Blazor callbacks
            if (dotnetInstance) {
                lightbox.on('openPswp', (e) => {
                    console.log('📸 PhotoSwipe opened');
                    dotnetInstance.invokeMethodAsync('OnOpen', { index: e.index || 0 });
                });

                lightbox.on('closePswp', (e) => {
                    console.log('🔒 PhotoSwipe closed');
                    dotnetInstance.invokeMethodAsync('OnClose', { index: e.index || 0 });
                });

                lightbox.on('change', (e) => {
                    console.log(`🔄 PhotoSwipe change: ${e.index}`);
                    dotnetInstance.invokeMethodAsync('OnChange', { index: e.index || 0 });
                });
            }

            // Initialize PhotoSwipe
            lightbox.init();
            console.log(`✅ PhotoSwipe initialized successfully for ${elementId}`);

            // Store instance for cleanup
            this.instances.set(elementId, {
                lightbox: lightbox,
                dotnetInstance: dotnetInstance
            });

            return {
                elementId: elementId,
                initialized: true
            };
        } catch (error) {
            console.error(`❌ Error initializing PhotoSwipe for ${elementId}:`, error);
            throw error;
        }
    },

    // Destroy PhotoSwipe instance
    destroy: function (elementId) {
        console.log(`🗑️ PhotoSwipeBlazor.destroy called for element: ${elementId}`);
        
        const instance = this.instances.get(elementId);
        if (instance) {
            try {
                if (instance.lightbox) {
                    // DOM-based lightbox
                    instance.lightbox.destroy();
                } else if (instance.pswp) {
                    // Data-based PhotoSwipe
                    instance.pswp.close();
                    instance.pswp.destroy();
                }
                this.instances.delete(elementId);
                console.log(`✅ PhotoSwipe destroyed successfully for ${elementId}`);
            } catch (error) {
                console.error(`❌ Error destroying PhotoSwipe for ${elementId}:`, error);
            }
        } else {
            console.warn(`⚠️ No PhotoSwipe instance found for ${elementId}`);
        }
    },

    // Create and open PhotoSwipe instance with data array (no DOM elements needed)
    createFromData: async function (instanceId, items, options, dotnetInstance, openIndex = 0) {
        console.log(`🚀 PhotoSwipeBlazor.createFromData called for instance: ${instanceId}`);
        
        if (!items || items.length === 0) {
            console.error(`❌ Items array is required for ${instanceId}`);
            throw new Error(`Items array is required for ${instanceId}`);
        }

        try {
            // Import PhotoSwipe modules dynamically
            console.log('📦 Importing PhotoSwipe modules...');
            const { default: PhotoSwipe } = await import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js');
            
            // Create PhotoSwipe configuration for data mode
            const config = {
                ...(options || {}),
                dataSource: items.map(item => ({
                    src: item.src,
                    width: item.width || 1920,
                    height: item.height || 1080,
                    alt: item.alt || '',
                    msrc: item.thumbnailUrl || item.src
                })),
                index: openIndex
            };

            console.log('⚙️ PhotoSwipe data config:', config);

            // Create PhotoSwipe instance directly
            const pswp = new PhotoSwipe(config);

            // Add event handlers for Blazor callbacks
            if (dotnetInstance) {
                pswp.on('openPswp', (e) => {
                    console.log('📸 PhotoSwipe opened (data mode)');
                    dotnetInstance.invokeMethodAsync('OnOpen', { index: pswp.currIndex || 0 });
                });

                pswp.on('close', (e) => {
                    console.log('🔒 PhotoSwipe closed (data mode)');
                    dotnetInstance.invokeMethodAsync('OnClose', { index: pswp.currIndex || 0 });
                });

                pswp.on('change', (e) => {
                    console.log(`🔄 PhotoSwipe change (data mode): ${pswp.currIndex}`);
                    dotnetInstance.invokeMethodAsync('OnChange', { index: pswp.currIndex || 0 });
                });
            }

            // Initialize and open PhotoSwipe
            pswp.init();
            console.log(`✅ PhotoSwipe data instance initialized and opened for ${instanceId}`);

            // Store instance for cleanup
            this.instances.set(instanceId, {
                lightbox: null, // No lightbox for data mode
                pswp: pswp,
                dotnetInstance: dotnetInstance
            });

            return {
                instanceId: instanceId,
                initialized: true,
                dataMode: true
            };
        } catch (error) {
            console.error(`❌ Error creating PhotoSwipe from data for ${instanceId}:`, error);
            throw error;
        }
    },

    // Open gallery at specific index
    open: function (elementId, index = 0) {
        const instance = this.instances.get(elementId);
        if (instance) {
            try {
                if (instance.lightbox) {
                    // DOM-based lightbox
                    instance.lightbox.loadAndOpen(index);
                    console.log(`📸 Opened PhotoSwipe at index ${index} for ${elementId}`);
                } else if (instance.pswp) {
                    // Data-based PhotoSwipe - already open, just navigate
                    instance.pswp.goTo(index);
                    console.log(`📸 Navigated PhotoSwipe to index ${index} for ${elementId}`);
                } else {
                    console.warn(`⚠️ No valid PhotoSwipe instance found for ${elementId}`);
                }
            } catch (error) {
                console.error(`❌ Error opening PhotoSwipe for ${elementId}:`, error);
            }
        } else {
            console.warn(`⚠️ No PhotoSwipe instance found for ${elementId}`);
        }
    }
};

console.log('✅ PhotoSwipeBlazor simple wrapper loaded');