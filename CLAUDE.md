# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a PhotoSwipe Blazor integration consisting of two projects:

- **PhotoSwipe.Blazor/** - Main Razor Class Library (RCL) that wraps PhotoSwipe JavaScript library
- **PhotoSwipe.Sample/** - Demo Blazor Web App showcasing the library features

## Build Commands

### Library Development (PhotoSwipe.Blazor)
```bash
cd PhotoSwipe.Blazor
npm install                    # Install PhotoSwipe dependencies
npm run build                  # Copy PhotoSwipe assets to wwwroot
dotnet build                   # Build the RCL
```

### Sample Application
```bash
cd PhotoSwipe.Sample
dotnet build                   # Build sample app (will also build referenced library)
dotnet run                     # Run the demo application
```

### Full Solution Build
```bash
# From repository root
dotnet build PhotoSwipe.Blazor/PhotoSwipe.Blazor.csproj
dotnet build PhotoSwipe.Sample/PhotoSwipe.Sample.csproj
```

## Architecture Overview

### JavaScript Interop Pattern
The library uses JavaScript module isolation with a custom interop layer:

- **photoswipe-interop.js** - Custom wrapper that manages PhotoSwipe instances and provides .NET-friendly APIs
- **PhotoSwipeInterop.cs** - C# service that communicates with JavaScript module using `IJSObjectReference`
- **Instance Management** - JavaScript maintains a Map of PhotoSwipe instances by unique IDs to support multiple galleries

Key interop methods:
- `initializeLightbox()` / `initializeGallery()` - Create PhotoSwipe instances
- `addEventHandler()` / `removeEventHandler()` - Bidirectional event system
- `destroy()` - Clean up resources and prevent memory leaks

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

### Data Models
- **PhotoSwipeItem** - Image data model with src, dimensions, thumbnails, and metadata
- **PhotoSwipeOptions** - Strongly-typed configuration with JSON serialization attributes
- **PhotoSwipeEvent** - Event data structure for JavaScript-to-.NET communication

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
1. JavaScript calls `[JSInvokable] HandleEvent()` method
2. PhotoSwipeInterop routes to appropriate EventCallback based on instance ID and event type
3. Components receive strongly-typed PhotoSwipeEventArgs

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
1. Add method to photoswipe-interop.js
2. Add corresponding C# method in PhotoSwipeInterop.cs
3. Update components to use new functionality
4. Ensure proper cleanup in destroy() method

### CSS Customization
- Component-specific styles go in `.razor.css` files (scoped)
- Global PhotoSwipe overrides should go in consuming app's CSS
- Use CSS custom properties for themeable values

## Sample Application Usage

The PhotoSwipe.Sample project demonstrates:
- Basic gallery with default templates
- Custom thumbnail templates with overlays
- Lightbox triggers with custom styling
- Event handling and state management
- Responsive design across device sizes

Navigate to `/photoswipe-demo` to see all features in action.

## Testing with Playwright

### Testing Structure
The project uses Playwright for end-to-end testing with the following organized structure:

```
tests/
├── playwright.config.js          # Main Playwright configuration
├── package.json                  # Test dependencies
├── e2e/                          # End-to-end test files
│   ├── smoke/                    # Smoke tests (basic functionality)
│   ├── gallery/                  # Gallery-specific tests
│   ├── lightbox/                 # Lightbox functionality tests
│   └── responsive/               # Responsive design tests
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

### Test Commands

**Prerequisites:**
1. Start the PhotoSwipe sample app: `cd PhotoSwipe.Sample && dotnet run`
2. Ensure app is running at `http://localhost:5224`

**Basic Test Commands:**
```bash
cd tests
npm test                          # Run all tests headless
npm run test:headed               # Run tests with browser UI
npm run test:ui                   # Run tests with Playwright UI mode
npm run show-report               # View HTML test report
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
- **Smoke Tests**: Basic app loading and core functionality
- **Feature Tests**: Specific PhotoSwipe features (gallery, lightbox, navigation)
- **Responsive Tests**: Mobile/tablet/desktop behavior
- **Cross-Browser Tests**: Browser compatibility testing

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

#### Test Data Management
- Store test data in `fixtures/test-data.js`
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
# Terminal 1: Start the app
cd PhotoSwipe.Sample
dotnet run

# Terminal 2: Run tests in watch mode
cd tests
npx playwright test --ui  # Interactive mode for development
```

**Debugging Failed Tests:**
1. Check the HTML report: `npm run show-report`
2. View screenshots in `test-results/artifacts/`
3. Use trace viewer: `npx playwright show-trace trace.zip`
4. Run specific test with debug: `npx playwright test --debug test-name.spec.js`