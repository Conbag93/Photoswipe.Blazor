# PhotoSwipe Blazor

A Blazor Server integration for PhotoSwipe 5, providing responsive image galleries and lightboxes with seamless .NET integration.

## Features

- **Responsive Image Galleries** - Mobile-first design with automatic grid layouts
- **PhotoSwipe 5 Integration** - Full support for the latest PhotoSwipe version
- **Blazor Server Components** - Native .NET integration with PhotoSwipeGallery and PhotoSwipeLightbox components  
- **Event Handling** - Bidirectional event system between JavaScript and .NET
- **Customizable Templates** - Support for custom item and trigger templates
- **CSS Isolation** - Scoped styling with CSS isolation support
- **Memory Management** - Proper cleanup and disposal patterns

## Quick Start

### 1. Installation

```bash
# Install the PhotoSwipe.Blazor package (when published)
dotnet add package PhotoSwipe.Blazor
```

### 2. Add Services

```csharp
// Program.cs
using PhotoSwipe.Blazor.Services;

builder.Services.AddScoped<PhotoSwipeInterop>();
```

### 3. Basic Gallery

```razor
@using PhotoSwipe.Blazor

<PhotoSwipeGallery Items="@galleryItems" />

@code {
    private List<PhotoSwipeItem> galleryItems = new()
    {
        new() { Src = "/images/photo1.jpg", Width = 1024, Height = 768, Thumbnail = "/images/thumb1.jpg" },
        new() { Src = "/images/photo2.jpg", Width = 1200, Height = 800, Thumbnail = "/images/thumb2.jpg" }
    };
}
```

## Development

### Prerequisites

- .NET 9.0 SDK
- Node.js 18+ (for PhotoSwipe assets)

### Building the Library

```bash
# 1. Build PhotoSwipe assets
cd PhotoSwipe.Blazor
npm install
npm run build

# 2. Build .NET library  
dotnet build

# 3. Run sample application
cd ../PhotoSwipe.Sample
dotnet run
```

The sample app will be available at `http://localhost:5224`

### Static Web Assets & Environment Configuration

The PhotoSwipe.Blazor library uses static web assets to serve CSS and JavaScript files. Understanding how these work is crucial for development and deployment:

**Development Environment:**
- Static web assets are served directly from the library's `wwwroot` folder via `StaticWebAssetsLoader`
- Requires `ASPNETCORE_ENVIRONMENT=Development` to enable the loader
- Assets are available at `_content/PhotoSwipe.Blazor/` paths

**Production Environment:**  
- Static web assets are embedded into the consuming application during build
- No special environment configuration needed
- Assets are served from the host application's static file middleware

**Example launchSettings.json:**
```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:5173",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "https": {
      "commandName": "Project", 
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "https://localhost:7173;http://localhost:5173",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "SSL_CERT_DIR": "$HOME/.aspnet/dev-certs/trust:/usr/lib/ssl/certs"
      }
    }
  }
}
```

**Common Issues:**
- **CSS/JS not loading:** Ensure `ASPNETCORE_ENVIRONMENT=Development` is set in development
- **404 errors for assets:** Check that the PhotoSwipe.Blazor project has been built (`npm run build`)
- **Certificate issues on Linux:** Set `SSL_CERT_DIR` environment variable (see HTTPS configuration above)

### Project Structure

- **PhotoSwipe.Blazor/** - Main Razor Class Library
- **PhotoSwipe.Sample/** - Demo Blazor application
- **tests/** - Playwright end-to-end tests

## Testing

This project uses Playwright for comprehensive end-to-end testing.

### Running Tests

**Prerequisites:**
1. Start the sample app: `cd PhotoSwipe.Sample && dotnet run`
2. Install test dependencies: `cd tests && npm install`

**Basic Commands:**
```bash
cd tests
npm test                    # Run all tests
npm run test:headed         # Run with browser UI  
npm run test:ui             # Interactive test runner
npm run show-report         # View test report
```

**Development Workflow:**
```bash
# Terminal 1: Start the app
cd PhotoSwipe.Sample && dotnet run

# Terminal 2: Run tests interactively
cd tests && npx playwright test --ui
```

### Test Structure

```
tests/
├── e2e/                    # Test files organized by feature
│   ├── smoke/             # Basic functionality tests
│   ├── gallery/           # Gallery-specific tests  
│   └── lightbox/          # Lightbox functionality tests
├── page-objects/          # Page Object Models
├── fixtures/              # Test data and fixtures
└── utils/                 # Test utilities and helpers
```

**Test Categories:**
- **Smoke Tests** - Basic app loading and core functionality
- **Gallery Tests** - Image grid, responsive behavior, custom templates
- **Lightbox Tests** - Opening, navigation, keyboard controls, touch gestures
- **Cross-Browser** - Chrome, Firefox, mobile viewports

### Writing Tests

Use the Page Object pattern for maintainable tests:

```javascript
const PhotoSwipePage = require('../page-objects/PhotoSwipePage');

test('should open lightbox when clicking image', async ({ page }) => {
  const photoSwipePage = new PhotoSwipePage(page);
  
  await photoSwipePage.goto();
  await photoSwipePage.openFirstImage();
  
  expect(await photoSwipePage.isLightboxOpen()).toBe(true);
});
```

## Documentation

- **[Development Guide](CLAUDE.md)** - Architecture, patterns, and development conventions
- **[PhotoSwipe Documentation](https://photoswipe.com/)** - Official PhotoSwipe docs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite: `cd tests && npm test`  
5. Submit a pull request

## License

This project is licensed under the MIT License.