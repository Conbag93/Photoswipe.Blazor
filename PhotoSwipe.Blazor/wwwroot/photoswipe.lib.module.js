// PhotoSwipe JavaScript Initializer - Runs in main page context after Blazor startup
// This solves the execution context issue that prevented event binding in ES6 modules

// Global PhotoSwipe management in main page context
window.PhotoSwipeManager = {
    instances: new Map(),
    instanceCounter: 0,
    PhotoSwipeLightbox: null,
    
    // Logging system
    LogLevel: {
        DEBUG: 0,
        INFO: 1, 
        WARN: 2,
        ERROR: 3
    },
    
    currentLogLevel: 1, // INFO level by default
    
    log(level, message, ...args) {
        if (level >= this.currentLogLevel) {
            const prefix = ['🔍 DEBUG', '📋 INFO', '⚠️ WARN', '❌ ERROR'][level];
            const timestamp = new Date().toISOString().substr(11, 12);
            console.log(`${prefix} [PhotoSwipe] [${timestamp}] ${message}`, ...args);
        }
    },
    
    logPerformance(label, startTime) {
        const duration = performance.now() - startTime;
        this.log(this.LogLevel.DEBUG, `⏱️ ${label}: ${duration.toFixed(2)}ms`);
    },
    
    // Initialize PhotoSwipe lightbox in main page context
    async initializeLightbox(elementId, options = {}) {
        const startTime = performance.now();
        const instanceId = `ps-${++this.instanceCounter}`;
        
        this.log(this.LogLevel.INFO, `🚀 Initializing PhotoSwipe lightbox in MAIN PAGE CONTEXT for element #${elementId} with instance ${instanceId}`);
        
        // Validate DOM element exists
        const galleryElement = document.querySelector(`#${elementId}`);
        if (!galleryElement) {
            this.log(this.LogLevel.ERROR, `Gallery element not found: #${elementId}`);
            return null;
        }
        
        // Ensure PhotoSwipe is loaded
        if (!this.PhotoSwipeLightbox) {
            this.log(this.LogLevel.ERROR, `PhotoSwipeLightbox not available. Ensure PhotoSwipe modules are loaded.`);
            return null;
        }
        
        // Match vanilla JS configuration exactly - run in main page context
        const defaultOptions = {
            gallery: `#${elementId}`,
            children: 'a',
            pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js'),
            ...options
        };
        
        this.log(this.LogLevel.INFO, `🔧 PhotoSwipe configuration (MAIN CONTEXT): ${JSON.stringify(defaultOptions)}`);
        
        // Create PhotoSwipe instance in main page context
        const lightbox = new this.PhotoSwipeLightbox(defaultOptions);
        
        // Store instance
        this.instances.set(instanceId, {
            lightbox: lightbox,
            elementId: elementId
        });
        
        // Add event handling
        lightbox.on('beforeOpen', (e) => {
            const currentIndex = e.index !== undefined ? e.index : 0;
            this.log(this.LogLevel.INFO, `🎯 PhotoSwipe beforeOpen (MAIN CONTEXT): instance ${instanceId}, opening index ${currentIndex}`);
        });
        
        lightbox.on('change', (e) => {
            const currentIndex = e.index !== undefined ? e.index : 0;
            this.log(this.LogLevel.INFO, `🔄 PhotoSwipe change (MAIN CONTEXT): instance ${instanceId}, index ${currentIndex}`);
        });
        
        lightbox.on('contentLoad', (e) => {
            const item = e.content.data;
            const actualIndex = e.index !== undefined ? e.index : 'undefined';
            this.log(this.LogLevel.INFO, `📸 Content load (MAIN CONTEXT): index ${actualIndex} - URL: ${item?.src || 'unknown'}`);
        });
        
        // Initialize PhotoSwipe - NOW IN MAIN PAGE CONTEXT!
        lightbox.init();
        
        this.logPerformance(`PhotoSwipe lightbox initialization (MAIN CONTEXT) for #${elementId}`, startTime);
        this.log(this.LogLevel.INFO, `✅ PhotoSwipe lightbox initialized successfully in MAIN PAGE CONTEXT - Element: ${elementId}, Instance: ${instanceId}`);
        
        return instanceId;
    },
    
    // Initialize PhotoSwipe gallery with data array
    async initializeGallery(elementId, items, options = {}) {
        const instanceId = `ps-${++this.instanceCounter}`;
        
        this.log(this.LogLevel.INFO, `🚀 Initializing PhotoSwipe gallery (MAIN CONTEXT) for element #${elementId} with ${items.length} items`);
        
        if (!this.PhotoSwipeLightbox) {
            this.log(this.LogLevel.ERROR, `PhotoSwipeLightbox not available`);
            return null;
        }
        
        const defaultOptions = {
            dataSource: items,
            pswpModule: () => import('/_content/PhotoSwipe.Blazor/js/photoswipe.esm.min.js'),
            ...options
        };
        
        const lightbox = new this.PhotoSwipeLightbox(defaultOptions);
        
        this.instances.set(instanceId, {
            lightbox: lightbox,
            elementId: elementId
        });
        
        lightbox.init();
        
        this.log(this.LogLevel.INFO, `✅ PhotoSwipe gallery initialized successfully (MAIN CONTEXT) - Instance: ${instanceId}, Items: ${items.length}`);
        
        return instanceId;
    },
    
    // Destroy PhotoSwipe instance
    async destroy(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            this.log(this.LogLevel.WARN, `⚠️ Instance ${instanceId} not found for destruction`);
            return;
        }
        
        try {
            this.log(this.LogLevel.INFO, `🗑️ Destroying PhotoSwipe instance ${instanceId} (MAIN CONTEXT)`);
            instance.lightbox.destroy();
            this.instances.delete(instanceId);
            this.log(this.LogLevel.INFO, `✅ PhotoSwipe instance ${instanceId} destroyed successfully (MAIN CONTEXT)`);
        } catch (error) {
            this.log(this.LogLevel.ERROR, `❌ Error destroying PhotoSwipe instance ${instanceId}:`, error);
            this.instances.delete(instanceId);
        }
    },
    
    // Open lightbox programmatically
    async openLightbox(instanceId, index = 0) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            this.log(this.LogLevel.ERROR, `Instance ${instanceId} not found`);
            return;
        }
        
        try {
            instance.lightbox.loadAndOpen(index);
            this.log(this.LogLevel.INFO, `📸 Opened PhotoSwipe instance ${instanceId} at index ${index} (MAIN CONTEXT)`);
        } catch (error) {
            this.log(this.LogLevel.ERROR, `❌ Error opening PhotoSwipe instance ${instanceId}:`, error);
        }
    }
};

// JavaScript initializer - called after Blazor starts
export function afterStarted(blazor) {
    console.log('🚀 PhotoSwipe JavaScript Initializer - afterStarted callback executing in MAIN PAGE CONTEXT');
    
    // Load PhotoSwipe modules in main page context
    import('/_content/PhotoSwipe.Blazor/js/photoswipe-lightbox.esm.min.js')
        .then(module => {
            window.PhotoSwipeManager.PhotoSwipeLightbox = module.default;
            console.log('✅ PhotoSwipeLightbox loaded in MAIN PAGE CONTEXT - ready for DOM event binding!');
            
            // Signal that PhotoSwipe is ready
            window.photoSwipeReady = true;
            
            // Dispatch custom event to notify components
            window.dispatchEvent(new CustomEvent('photoswipe-ready', { 
                detail: { 
                    context: 'main-page',
                    manager: window.PhotoSwipeManager 
                } 
            }));
        })
        .catch(error => {
            console.error('❌ Failed to load PhotoSwipe modules in main page context:', error);
        });
}