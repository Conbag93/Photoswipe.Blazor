# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a PhotoSwipe Blazor integration demonstrating multi-platform Blazor architecture:

- **PhotoSwipe.Blazor/** - Main Razor Class Library (RCL) that wraps PhotoSwipe JavaScript library
- **PhotoSwipe.Demos/** - Shared demo components library (render mode agnostic)
- **PhotoSwipe.Sample/** - Blazor Server demo application (port 5224)
- **PhotoSwipe.Wasm.GitHub/** - Blazor WebAssembly demo application (port 5225)
- **tests/** - Playwright end-to-end tests supporting both hosting models

## Build Commands

### Library Development (PhotoSwipe.Blazor)
```bash
cd PhotoSwipe.Blazor
npm install                    # Install PhotoSwipe dependencies
npm run build                  # Copy PhotoSwipe assets to wwwroot
dotnet build                   # Build the RCL
```

### Demo Applications
```bash
# Blazor Server Demo (PhotoSwipe.Sample)
cd PhotoSwipe.Sample
dotnet build                   # Build sample app (will also build referenced library)
dotnet watch --urls http://localhost:5224   # Run Server demo with watch mode

# Blazor WebAssembly Demo (PhotoSwipe.Wasm.GitHub)
cd PhotoSwipe.Wasm.GitHub
dotnet build                   # Build WASM app
dotnet watch --urls http://localhost:5225   # Run WASM demo with watch mode
```

### Full Solution Build
```bash
# From repository root
dotnet build PhotoSwipe.Blazor/PhotoSwipe.Blazor.csproj
dotnet build PhotoSwipe.Demos/PhotoSwipe.Demos.csproj
dotnet build PhotoSwipe.Sample/PhotoSwipe.Sample.csproj
dotnet build PhotoSwipe.Wasm.GitHub/PhotoSwipe.Wasm.GitHub.csproj
```

## Architecture Overview

### JavaScript Interop Pattern
The library uses a simplified JavaScript wrapper pattern with direct PhotoSwipe integration:

- **photoswipe-simple.js** - Simple wrapper that creates PhotoSwipe instances using standard DOM-based initialization
- **PhotoSwipeInterop.cs** - C# service that manages PhotoSwipe lifecycle through JavaScript interop
- **DOM-based initialization** - PhotoSwipe reads gallery configuration directly from DOM elements with `data-pswp-*` attributes

Key interop methods:
- `InitializeLightboxAsync()` - Creates PhotoSwipe Lightbox instances for DOM-based galleries
- `OpenGalleryAsync()` - Programmatically opens gallery at specific index
- `DestroyAsync()` - Cleans up PhotoSwipe instances and prevents memory leaks

The approach resolves Blazor navigation conflicts by ensuring PhotoSwipe handles anchor tag clicks instead of Blazor's EventDelegator, using proper gallery selector configuration and navigation prevention techniques.

### Component Architecture

**PhotoSwipeGallery Component:**
- Renders responsive image grid using CSS isolation
- Binds to DOM elements via `data-pswp-*` attributes
- Supports custom templates through `ItemTemplate` RenderFragment
- Handles gallery initialization and event binding in `OnAfterRenderAsync`

**PhotoSwipeLightbox Component:**
- Creates individual trigger elements for programmatic lightbox opening
- Uses data array instead of DOM scanning
- Supports custom trigger templates via `TriggerTemplate` RenderFragment

**PhotoSwipeUploadGallery Component:**
- Extends PhotoSwipeGallery with comprehensive upload functionality
- Implements drag & drop and file input for image uploads
- Supports Add/Replace modes for gallery management
- Includes file validation (size, type) and error handling
- Provides upload preview before confirmation
- Integrates with ImageProcessingService for client-side image optimization
- Manages upload state and progress indicators
- Supports selection with AllowAdd/AllowDelete permission controls
- Enables custom overlay controls via CustomOverlayControls parameter

**PhotoSwipeOverlayControl Component:**
- Provides flexible overlay controls positioned over gallery items
- Supports 9 predefined positions (TopLeft, TopRight, TopCenter, BottomLeft, BottomRight, BottomCenter, CenterLeft, CenterRight, Center) plus Custom positioning
- Smart spacing system for multiple controls at the same position with configurable grow direction
- Flexible content options: Icon (text/emoji/HTML), ChildContent (custom RenderFragment), or button with custom styling
- Built-in click event handling with configurable preventDefault and stopPropagation
- Accessibility features with Title, AriaLabel, and disabled state support
- CSS integration with custom classes and positioning styles
- Prevents PhotoSwipe gallery navigation when clicked (via data-pswp-prevent-gallery attribute)

### Data Models
- **PhotoSwipeItem** - Image data model with src, dimensions, thumbnails, and metadata
- **PhotoSwipeOptions** - Strongly-typed configuration with JSON serialization attributes
- **PhotoSwipeEvent** - Event data structure for JavaScript-to-.NET communication
- **PhotoSwipeUploadMode** - Enum for upload behavior (Add/Replace)

### Services
- **PhotoSwipeInterop** - JavaScript interop service managing PhotoSwipe lifecycle
- **ImageProcessingService** - Client-side image processing for uploads
  - Resizes images to maximum dimensions
  - Converts images to optimized formats
  - Extracts image metadata (dimensions, size)
  - Generates data URLs for preview
  - Validates file types and sizes

### CSS Strategy
- **CSS Isolation** - Each component has `.razor.css` files for scoped styling
- **Responsive Design** - Mobile-first grid layouts with breakpoints
- **Asset Bundling** - PhotoSwipe CSS copied from npm package to wwwroot/css/

## Key Development Patterns

### Component Lifecycle
```csharp
// Standard pattern in components
protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender && _interop != null)
    {
        _instanceId = await _interop.InitializeLightboxAsync(ElementId, Options);
        // Set up event handlers...
    }
}
```

### Memory Management
All components implement `IAsyncDisposable` and follow this cleanup pattern:
```csharp
public async ValueTask DisposeAsync()
{
    if (_interop != null && _instanceId != null)
    {
        await _interop.DestroyAsync(_instanceId);
    }
    if (_interop != null)
    {
        await _interop.DisposeAsync();
    }
}
```

### Event Handling
Events flow from JavaScript → PhotoSwipeInterop → Component via EventCallback:
1. PhotoSwipe fires events (openPswp, closePswp, change) to JavaScript event handlers
2. JavaScript calls `[JSInvokable]` methods (OnOpen, OnClose, OnChange) on PhotoSwipeInterop
3. PhotoSwipeInterop routes events to component EventCallback handlers based on instance ID
4. Components receive strongly-typed PhotoSwipeEventArgs

## Asset Management

### PhotoSwipe Integration
The library uses PhotoSwipe 5.x with these key files:
- `photoswipe.esm.min.js` - Core PhotoSwipe module
- `photoswipe-lightbox.esm.min.js` - Lightbox functionality
- `photoswipe.css` - Required styles

### Build Process
1. npm installs PhotoSwipe package
2. npm run build copies assets from node_modules to wwwroot/
3. dotnet build includes wwwroot/ as static web assets
4. Consuming applications reference via `_content/PhotoSwipe.Blazor/` path

## Working with Components

### Adding New Configuration Options
1. Add property to PhotoSwipeOptions.cs with JsonPropertyName attribute
2. Update JavaScript interop to pass option to PhotoSwipe constructor
3. Update README.md with new option documentation

### Extending JavaScript Functionality
1. Add method to photoswipe-simple.js
2. Add corresponding C# method in PhotoSwipeInterop.cs
3. Update components to use new functionality
4. Ensure proper cleanup in destroy() method

### Adding Upload Features
1. Extend PhotoSwipeUploadGallery with new upload options
2. Update ImageProcessingService for additional processing needs
3. Add validation rules in component properties
4. Implement event callbacks for new interactions

### CSS Customization
- Component-specific styles go in `.razor.css` files (scoped)
- Global PhotoSwipe overrides should go in consuming app's CSS
- Use CSS custom properties for themeable values

## Sample Application Usage

The PhotoSwipe.Sample project demonstrates various features across multiple demo pages:

### Demo Pages
- **/ (Home)** - Welcome page with project overview and navigation
- **/vanilla-js-demo** - Direct JavaScript PhotoSwipe integration examples
- **/basic-photoswipe-demo** - Basic PhotoSwipe Blazor component demonstrations:
  - Basic DOM gallery with PhotoSwipeGallery component
  - Array-based gallery with programmatic control
  - Individual image lightboxes with PhotoSwipeLightbox component
  - Custom templates and styling examples
- **/extended-features-demo** - Advanced PhotoSwipe functionality:
  - Selection and deletion capabilities with PhotoSwipeUploadGallery
  - Custom overlay controls with PhotoSwipeOverlayControl component
  - Smart positioning and interactive workflows

### Key Features Demonstrated
- Basic galleries with responsive layouts
- Custom thumbnail templates with overlays
- Lightbox triggers with custom styling
- File upload with drag & drop
- Upload modes (Add vs Replace)
- File validation and error handling
- Upload preview and confirmation
- Event handling and state management
- Responsive design across device sizes

## Testing with Playwright

### Testing Structure
The project uses Playwright for comprehensive end-to-end testing with a clear organizational structure that separates base PhotoSwipe wrapper functionality from extended features:

```
tests/
├── playwright.config.js          # Main Playwright configuration
├── package.json                  # Test dependencies
├── e2e/                          # End-to-end test files
│   ├── setup/                    # Infrastructure and setup tests
│   │   ├── app-loading.spec.js   # App initialization and JavaScript availability
│   │   └── navigation.spec.js    # Navigation between demo pages
│   ├── base/                     # Core PhotoSwipe wrapper tests
│   │   ├── gallery-display.spec.js # Gallery rendering and layout
│   │   ├── interop.spec.js       # JavaScript interop and lifecycle
│   │   └── lightbox.spec.js      # Basic lightbox functionality
│   └── extensions/               # Extended feature tests
│       ├── upload.spec.js        # File upload functionality
│       ├── selection.spec.js     # Single/multi selection modes
│       ├── deletion.spec.js      # Item deletion and overlay controls
│       ├── reordering.spec.js    # Image reordering functionality
│       └── integration.spec.js   # Cross-feature integration and error detection
├── page-objects/                 # Page Object Models
│   └── PhotoSwipePage.js         # PhotoSwipe page interactions
├── fixtures/                     # Test data and fixtures
│   └── test-data.js              # Common test data
├── utils/                        # Test utilities and helpers
│   ├── global-setup.js           # Global test setup
│   ├── global-teardown.js        # Global test cleanup
│   └── test-helpers.js           # Helper functions
└── test-results/                 # Generated test results
    ├── html-report/              # HTML test reports
    ├── artifacts/                # Screenshots, videos, traces
    └── screenshots/              # Manual screenshots
```

### Testing Methodology

#### Test Organization Philosophy
- **Setup Tests**: Infrastructure tests that verify the application loads correctly and navigation works
- **Base Tests**: Core functionality tests that verify the PhotoSwipe wrapper works correctly in Blazor
- **Extension Tests**: Comprehensive tests for each extended feature (uploads, deletion, selection, reordering)
- **Integration Tests**: Cross-feature interaction tests and error detection

#### Feature Isolation Strategy
We are currently implementing a feature isolation strategy (see `docs/testing/feature-isolation-strategy.md`) that involves:

1. **Dedicated Test Pages**: Creating isolated test pages for each feature (e.g., `/test/selection`, `/test/upload`)
2. **Comprehensive Test Suites**: Each feature has its own comprehensive test file covering all aspects
3. **Clear Separation**: Base wrapper tests are separated from extended feature tests
4. **Performance Focus**: Isolated environments enable faster test execution and debugging

### Test Commands

**Prerequisites:**
1. Start both demo applications:
   - Server: `cd PhotoSwipe.Sample && dotnet watch --urls http://localhost:5224`
   - WASM: `cd PhotoSwipe.Wasm.GitHub && dotnet watch --urls http://localhost:5225`
2. Install test dependencies: `cd tests && npm install`

**Basic Test Commands:**
```bash
cd tests
npm test                          # Run all tests (both Server & WASM)
npm run test:headed               # Run tests with browser UI
npm run test:ui                   # Run tests with Playwright UI mode
npm run show-report               # View HTML test report

# Target specific hosting models:
npm run test:server               # Test only Server (port 5224)
npm run test:wasm                 # Test only WASM (port 5225)
npm run test:server-all           # All Server browsers
npm run test:wasm-all             # All WASM browsers

# Cross-platform testing:
npm run test:chrome               # Both Server & WASM on Chrome
npm run test:firefox              # Both Server & WASM on Firefox
npm run test:mobile               # Both hosting models on mobile
```

**Advanced Commands:**
```bash
npx playwright test --grep "smoke"           # Run only smoke tests
npx playwright test --project="Mobile Chrome"  # Run on specific browser
npx playwright test --debug                    # Debug mode with browser DevTools
npx playwright test --trace=on                 # Record traces for all tests
```

### Testing Conventions

#### File Naming
- Test files: `*.spec.js` (e.g., `gallery.spec.js`)
- Page objects: `*Page.js` (e.g., `PhotoSwipePage.js`)
- Utilities: `*.js` (e.g., `test-helpers.js`)

#### Test Organization
- **Setup Tests** (`setup/`): Basic app loading, JavaScript availability, and navigation
- **Base Tests** (`base/`): Core PhotoSwipe wrapper functionality - gallery display, lightbox behavior, JavaScript interop
- **Extension Tests** (`extensions/`): Extended feature testing - uploads, selection, deletion, reordering
- **Integration Tests** (`extensions/integration.spec.js`): Cross-feature interactions and error detection

#### Page Object Pattern
Always use Page Object Models for reusable page interactions:

```javascript
const PhotoSwipePage = require('../page-objects/PhotoSwipePage');

test('should open lightbox', async ({ page }) => {
  const photoSwipePage = new PhotoSwipePage(page);
  await photoSwipePage.goto();
  await photoSwipePage.openFirstImage();
  expect(await photoSwipePage.isLightboxOpen()).toBe(true);
});
```

#### Using Centralized Configuration
All tests should leverage the centralized configuration for consistency:

```javascript
const testData = require('../../fixtures/test-data');

test('should navigate to demo page', async ({ page }) => {
  // Use centralized URLs
  await page.goto(testData.urls.basicPhotoswipeDemo);

  // Use centralized selectors
  const galleryImages = page.locator(testData.selectors.galleryImages);
  await expect(galleryImages.first()).toBeVisible();

  // Use centralized timeouts
  await page.waitForTimeout(testData.timeouts.short);

  // Use centralized expected values
  await expect(page).toHaveTitle(testData.expectedTitles.basicPhotoswipeDemo);
});
```

#### Centralized Test Configuration
The testing infrastructure uses centralized configuration for consistency and maintainability:

**Test Data** (`fixtures/test-data.js`):
- **URLs**: Centralized page URLs for all demo pages
- **Selectors**: Common DOM selectors for PhotoSwipe elements
- **Timeouts**: Standardized timeout values (short, medium, long)
- **Sample Data**: Test image dimensions and metadata

**Playwright Config** (`playwright.config.js`):
- **TEST_CONFIG**: Centralized port and baseURL configuration
- **Unified test settings**: Shared timeouts, retries, and output paths
- **Project definitions**: Browser and hosting model configurations

#### Test Data Management
- All test data is centralized in `fixtures/test-data.js`
- Tests import and use the shared `testData` object
- Use descriptive constants instead of magic strings/numbers
- Keep test data separate from test logic

#### Error Handling and Debugging
- Use proper wait strategies (avoid hard-coded timeouts)
- Take screenshots on failures (configured automatically)
- Use meaningful test descriptions and assertion messages
- Check console for JavaScript errors in tests

#### Performance Testing
- Monitor network requests and page load times
- Test image loading performance
- Validate PhotoSwipe initialization time

### Best Practices

#### Test Writing
1. **Arrange-Act-Assert Pattern**: Structure tests clearly
2. **Independent Tests**: Each test should be runnable in isolation
3. **Descriptive Names**: Test names should describe the expected behavior
4. **Single Responsibility**: One test should verify one behavior
5. **Proper Cleanup**: Use fixtures and hooks for setup/teardown

#### Selectors
- Prefer `data-testid` attributes over CSS classes
- Use PhotoSwipe's built-in `data-pswp-*` attributes when available
- Avoid fragile selectors (nth-child, complex CSS)

#### Assertions
- Use specific assertions (`toBeVisible()` vs `toBeTruthy()`)
- Add custom timeout values for slow operations
- Group related assertions logically

#### Test Maintenance
- Run tests regularly in CI/CD
- Update tests when UI changes
- Remove obsolete or flaky tests
- Keep test dependencies up to date

### Running Tests for Development

**Quick Development Workflow:**
```bash
# Terminal 1: Start Server demo
cd PhotoSwipe.Sample
dotnet watch --urls http://localhost:5224

# Terminal 2: Start WASM demo
cd PhotoSwipe.Wasm.GitHub
dotnet watch --urls http://localhost:5225

# Terminal 3: Run tests in interactive mode
cd tests
npx playwright test --ui  # Interactive mode for development
```

**Debugging Failed Tests:**
1. Check the HTML report: `npm run show-report`
2. View screenshots in `test-results/artifacts/`
3. Use trace viewer: `npx playwright show-trace trace.zip`
4. Run specific test with debug: `npx playwright test --debug test-name.spec.js`
- If we try to run the program and the port is already in use, then use pkill -f Photoswipe to terminate the current process before trying again

## VS Code Configuration

### Launch Configurations

The repository includes VS Code launch configurations for debugging both hosting models:

**Individual Launch Configurations:**
- **Launch PhotoSwipe Sample (HTTP)** - Blazor Server on port 5224
- **Launch PhotoSwipe Sample (HTTPS)** - Blazor Server with HTTPS
- **Launch PhotoSwipe Sample (Watch Mode)** - Server with hot reload
- **Launch PhotoSwipe WASM (HTTP)** - Blazor WebAssembly on port 5225
- **Launch PhotoSwipe WASM (Watch Mode)** - WASM with hot reload

**Compound Launch Configuration:**
- **Launch Both Server & WASM (Watch Mode)** - Starts both projects simultaneously

### Build Tasks

VS Code tasks are configured for all projects:

- **build** - Build Server project
- **build-library** - Build PhotoSwipe.Blazor library
- **build-photoswipe-assets** - Build PhotoSwipe CSS/JS assets
- **build-wasm** - Build WASM project (depends on library and assets)
- **publish** - Publish Server project
- **publish-wasm** - Publish WASM project
- **watch** - Server project in watch mode
- **watch-wasm** - WASM project in watch mode

### Development Workflow

1. **F5** (Run and Debug) - Select compound launch to start both projects
2. **Ctrl+Shift+P** → "Tasks: Run Task" → Select specific build/watch tasks
3. Access demos at:
   - Server: http://localhost:5224
   - WASM: http://localhost:5225

Both applications will have identical functionality thanks to the shared PhotoSwipe.Demos library.