# PhotoSwipe Blazor

A comprehensive Blazor wrapper and extension library for PhotoSwipe 5, providing not only responsive image galleries and lightboxes but also enhanced functionality for file uploads, image management, and interactive galleries.

## Overview

PhotoSwipe.Blazor is more than just a wrapper - it's a feature-rich Blazor component library that:
- **Wraps PhotoSwipe** - Provides full PhotoSwipe 5 integration with Blazor-friendly APIs
- **Extends Functionality** - Adds upload capabilities, image processing, and management features
- **Simplifies Integration** - Offers strongly-typed C# models and seamless JavaScript interop

## Features

### Core Gallery Features
- **Responsive Image Galleries** - Mobile-first design with automatic grid layouts
- **PhotoSwipe 5 Integration** - Full support for the latest PhotoSwipe version
- **Multi-Platform Support** - Compatible with Blazor Server, WebAssembly, and Hybrid apps
- **Event Handling** - Bidirectional event system between JavaScript and .NET
- **Customizable Templates** - Support for custom item and trigger templates
- **CSS Isolation** - Scoped styling with CSS isolation support
- **Memory Management** - Proper cleanup and disposal patterns

### Extended Features
- **File Upload Gallery** - Drag & drop and file input support for adding images
- **Image Processing** - Client-side image resizing and optimization
- **Upload Modes** - Add to existing gallery or replace entire gallery
- **File Validation** - Size limits, type restrictions, and error handling
- **Preview System** - Review uploads before confirming
- **Progress Indicators** - Real-time upload and processing feedback

### Placeholder System
- **Display Items vs Data Items** - Architectural separation of UI elements from gallery data
- **Interactive Placeholders** - Upload, SeeMore, Pagination, and LoadMore placeholder types
- **PhotoSwipe Prevention** - Placeholders don't trigger PhotoSwipe lightbox opening
- **Index Management** - Proper index mapping for reordering and data operations
- **Extensible Types** - Type-safe placeholder system with configurable metadata
- **Custom Positioning** - Flexible placement within gallery (First/Last/Custom)

## Components

- **PhotoSwipeGallery** - Standard responsive image gallery with lightbox
- **PhotoSwipeLightbox** - Programmatic lightbox triggers
- **PhotoSwipeUploadGallery** - Extended gallery with upload capabilities
- **PhotoSwipeOverlayControl** - Flexible overlay controls positioned over gallery items

## Quick Start

### 1. Installation

```bash
# Install the PhotoSwipe.Blazor package (when published)
dotnet add package PhotoSwipe.Blazor
```

### 2. Add Services

**For Blazor Server apps:**
```csharp
// Program.cs
using PhotoSwipe.Blazor.Extensions;

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddPhotoSwipe();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();
```

**For Blazor WebAssembly apps:**
```csharp
// Program.cs (Client)
using PhotoSwipe.Blazor.Extensions;

builder.Services.AddPhotoSwipe();
```

**For Blazor Web Apps (Server + WASM):**
```csharp
// Program.cs
using PhotoSwipe.Blazor.Extensions;

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

builder.Services.AddPhotoSwipe();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(PhotoSwipe.Blazor._Imports).Assembly);
```

**For MAUI Hybrid apps:**
```csharp
// MauiProgram.cs
using PhotoSwipe.Blazor.Extensions;

builder.Services.AddMauiBlazorWebView();
builder.Services.AddPhotoSwipe();
```

### 3. Include CSS and JavaScript

Add to your App.razor or index.html:

```html
<link rel="stylesheet" href="_content/PhotoSwipe.Blazor/css/photoswipe.css" />
<link rel="stylesheet" href="_content/PhotoSwipe.Blazor/css/photoswipe-overlay-controls.css" />
<script src="_content/PhotoSwipe.Blazor/photoswipe-simple.js"></script>
```

**For demo/extended features (upload galleries, overlay controls):**
```html
<link rel="stylesheet" href="_content/PhotoSwipe.Demos/css/photoswipe-demos.css" />
```

### 4. Basic Gallery

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

## Platform-Specific Notes

### Blazor Server
- Full functionality with real-time JavaScript interop over SignalR
- No additional configuration needed beyond service registration

### Blazor WebAssembly
- All features work identically to Server
- JavaScript runs directly in browser for optimal performance
- Static assets served via RCL paths (`_content/PhotoSwipe.Blazor/`)

### Blazor Hybrid (MAUI)
- Components work seamlessly in WebView
- File upload may require platform-specific permissions
- Consider mobile-optimized touch interactions

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

# 3. Run demo applications
# Blazor Server demo:
cd ../PhotoSwipe.Sample
dotnet run

# Blazor WebAssembly demo (separate terminal):
cd ../PhotoSwipe.Wasm.GitHub
dotnet run
```

Demo applications will be available at:
- **Blazor Server**: `http://localhost:5224`
- **Blazor WebAssembly**: `http://localhost:5225`

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

- **PhotoSwipe.Blazor/** - Main Razor Class Library with gallery components and services
- **PhotoSwipe.Demos/** - Shared demo components and layouts used by sample projects
- **PhotoSwipe.Sample/** - Blazor Server demo application showcasing all features
- **PhotoSwipe.Wasm.GitHub/** - Blazor WebAssembly demo application (identical functionality to Server)
- **tests/** - Playwright end-to-end tests

### Multi-Platform Architecture

The repository demonstrates a multi-platform Blazor setup:

1. **Core Library (PhotoSwipe.Blazor)** - Contains all PhotoSwipe components and services
2. **Shared Demo Library (PhotoSwipe.Demos)** - Contains reusable demo components, layouts, and styling
3. **Server Demo (PhotoSwipe.Sample)** - Blazor Server hosting model implementation
4. **WebAssembly Demo (PhotoSwipe.Wasm.GitHub)** - Blazor WASM hosting model implementation

Both demo projects reference the shared libraries and provide identical functionality across different hosting models.

### Demo Pages

The sample application includes several demo pages showcasing different features:

- **/ (Home)** - Welcome page with project overview and getting started information
- **/vanilla-js-demo** - Direct JavaScript PhotoSwipe integration examples showing traditional usage
- **/basic-photoswipe-demo** - Basic PhotoSwipe Blazor component demonstrations including DOM galleries, array-based galleries, and individual lightboxes
- **/extended-features-demo** - Advanced functionality including selection/deletion capabilities, custom overlay controls, and interactive workflows

## Testing

This project uses Playwright for comprehensive end-to-end testing.

### Running Tests

**Prerequisites:**
1. Start both demo applications:
   - Server: `cd PhotoSwipe.Sample && dotnet watch --urls http://localhost:5224`
   - WASM: `cd PhotoSwipe.Wasm.GitHub && dotnet watch --urls http://localhost:5225`
2. Install test dependencies: `cd tests && npm install`

**Basic Commands:**
```bash
cd tests
npm test                    # Run all tests (both Server & WASM)
npm run test:headed         # Run with browser UI
npm run test:ui             # Interactive test runner
npm run show-report         # View test report

# Target specific hosting models:
npm run test:server         # Test only Server (port 5224)
npm run test:wasm           # Test only WASM (port 5225)
npm run test:server-all     # All Server browsers
npm run test:wasm-all       # All WASM browsers

# Cross-platform testing:
npm run test:chrome         # Both Server & WASM on Chrome
npm run test:firefox        # Both Server & WASM on Firefox
npm run test:mobile         # Both hosting models on mobile
```

**Development Workflow:**
```bash
# Terminal 1: Start Server demo
cd PhotoSwipe.Sample && dotnet watch --urls http://localhost:5224

# Terminal 2: Start WASM demo
cd PhotoSwipe.Wasm.GitHub && dotnet watch --urls http://localhost:5225

# Terminal 3: Run tests interactively
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

## API Reference

### Placeholder System Models

#### PhotoSwipePlaceholderType

Defines the types of placeholders available in the gallery system:

```csharp
public enum PhotoSwipePlaceholderType
{
    Upload,      // Upload placeholder - allows adding new items to the gallery
    SeeMore,     // See more placeholder - expands or navigates to additional content
    Pagination,  // Pagination placeholder - for loading additional pages of content
    LoadMore     // Load more placeholder - for infinite scroll or manual load more functionality
}
```

#### PhotoSwipePlaceholderInfo

Comprehensive placeholder metadata and configuration class:

```csharp
public class PhotoSwipePlaceholderInfo
{
    public PhotoSwipePlaceholderType Type { get; set; }
    public PhotoSwipeContainedUploadPosition Position { get; set; } = PhotoSwipeContainedUploadPosition.Last;
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public string? Text { get; set; } = "Add files...";
    public string? CssClass { get; set; }
    public object? CustomData { get; set; }
    public bool IsEnabled { get; set; } = true;

    // Converts placeholder to PhotoSwipeItem for rendering
    public PhotoSwipeItem ToDisplayItem();
}
```

#### PhotoSwipeContainedUploadPosition

Controls where placeholders appear within the gallery:

```csharp
public enum PhotoSwipeContainedUploadPosition
{
    First,  // Placeholder appears as the first item in the gallery
    Last    // Placeholder appears as the last item in the gallery
}
```

#### PhotoSwipeItemExtensions

Extension methods for placeholder detection and management:

```csharp
public static class PhotoSwipeItemExtensions
{
    public static bool IsPlaceholder(this PhotoSwipeItem item);
    public static PhotoSwipePlaceholderType? GetPlaceholderType(this PhotoSwipeItem item);
    public static string? GetPlaceholderId(this PhotoSwipeItem item);
}
```

### PhotoSwipeUploadGallery Placeholder Parameters

Configure placeholder behavior with these component parameters:

```csharp
[Parameter] public PhotoSwipeContainedUploadPosition ContainedUploadPosition { get; set; } = PhotoSwipeContainedUploadPosition.Last;
[Parameter] public string UploadPlaceholderText { get; set; } = "Add Files";
```

**Usage Example:**
```razor
<PhotoSwipeUploadGallery Items="@galleryItems"
                        UploadPosition="PhotoSwipeUploadPosition.Contained"
                        ContainedUploadPosition="PhotoSwipeContainedUploadPosition.First"
                        UploadPlaceholderText="Upload Images..."
                        AllowAdd="true" />
```

### Architecture: Display Items vs Data Items

The placeholder system implements a dual-collection architecture:

**Data Items (`_dataItems`):**
- Contains only actual gallery content (images, media)
- Used for data operations (save, export, API calls)
- Maintains clean data model without UI artifacts
- Proper index mapping for reordering operations

**Display Items (`_displayItems`):**
- Combined collection of data items + placeholders
- Used for UI rendering
- Includes interactive placeholder elements
- Handles PhotoSwipe prevention for placeholders

**Benefits:**
- **Clean Data Model** - Gallery data stays pure without UI elements
- **Correct Index Mapping** - Reordering works on data indices, not display indices
- **Extensible UI** - Add multiple placeholder types without affecting data
- **Event Handling** - Placeholder-specific interactions and callbacks

### Extensibility Guide for Library Consumers

The placeholder system is designed for extensibility. Library consumers can leverage this architecture for custom interactive gallery elements:

#### Current Implementation (Upload Placeholder)

The upload placeholder demonstrates the full pattern:

```csharp
// 1. Configure placeholder in PhotoSwipeUploadGallery
var uploadPlaceholder = new PhotoSwipePlaceholderInfo
{
    Type = PhotoSwipePlaceholderType.Upload,
    Position = PhotoSwipeContainedUploadPosition.Last,
    Text = "Add files...",
    IsEnabled = true
};

// 2. Placeholder is automatically converted to PhotoSwipeItem
var displayItem = uploadPlaceholder.ToDisplayItem();

// 3. Custom rendering prevents PhotoSwipe opening
// Uses data-pswp-prevent-gallery="true"
// Implements custom click handlers
```

#### Future Extension Points

**Custom Placeholder Types:**
```csharp
// Future: Custom placeholder types via configuration
public enum CustomPlaceholderType
{
    LoadMore,     // Infinite scroll trigger
    SeeMore,      // Expand gallery view
    AddFolder,    // Directory creation
    ImportCloud,  // Cloud service integration
    Pagination    // Page navigation
}
```

**Template Customization:**
```csharp
// Future: Custom placeholder templates
[Parameter] public RenderFragment<PhotoSwipePlaceholderInfo>? PlaceholderTemplate { get; set; }

// Usage:
<PhotoSwipeUploadGallery>
    <PlaceholderTemplate Context="placeholder">
        <div class="custom-placeholder-@placeholder.Type.ToString().ToLower()">
            <MyCustomIcon Type="@placeholder.Type" />
            <span>@placeholder.Text</span>
        </div>
    </PlaceholderTemplate>
</PhotoSwipeUploadGallery>
```

**Multi-Placeholder Support:**
```csharp
// Future: Multiple placeholder configuration
[Parameter] public List<PhotoSwipePlaceholderInfo> Placeholders { get; set; } = new();

// Usage: Mix upload, pagination, and see-more placeholders
Placeholders = new List<PhotoSwipePlaceholderInfo>
{
    new() { Type = PhotoSwipePlaceholderType.Upload, Position = PhotoSwipeContainedUploadPosition.First },
    new() { Type = PhotoSwipePlaceholderType.LoadMore, Position = PhotoSwipeContainedUploadPosition.Last },
    new() { Type = PhotoSwipePlaceholderType.SeeMore, Position = PhotoSwipeContainedUploadPosition.Last }
};
```

**Event Handling:**
```csharp
// Future: Placeholder-specific event callbacks
[Parameter] public EventCallback<PlaceholderClickEventArgs> OnPlaceholderClick { get; set; }

public class PlaceholderClickEventArgs
{
    public PhotoSwipePlaceholderType Type { get; set; }
    public string PlaceholderId { get; set; }
    public object? CustomData { get; set; }
}
```

#### Key Architectural Patterns

**For Library Maintainers:**
1. **Type Safety** - Use enums and strongly-typed models
2. **Metadata Attachment** - Leverage `CustomData` for type-specific configuration
3. **PhotoSwipe Prevention** - Always use `data-pswp-prevent-gallery="true"` for interactive placeholders
4. **Index Mapping** - Operations should work on `_dataItems`, not `_displayItems`
5. **Event Isolation** - Placeholder events should not interfere with gallery events

**For Consumer Applications:**
1. **Placeholder Detection** - Use `item.IsPlaceholder()` extension method
2. **Type Checking** - Use `item.GetPlaceholderType()` for conditional logic
3. **Clean Data Access** - Always work with data items for persistence/API operations
4. **UI Customization** - Override CSS classes or leverage future template support

This architecture ensures the placeholder system can grow to support complex interactive gallery scenarios while maintaining clean separation between data and UI concerns.

## Documentation

- **[Development Guide](CLAUDE.md)** - Architecture, patterns, and development conventions
- **[PhotoSwipe Documentation](https://photoswipe.com/)** - Official PhotoSwipe docs

## Roadmap

PhotoSwipe.Blazor now includes a comprehensive placeholder system and advanced gallery features. We continue to plan additional enhancements:

### Recently Implemented ✅
- **Placeholder System** - Interactive UI elements (Upload, SeeMore, Pagination, LoadMore) with PhotoSwipe prevention
- **Display Items Architecture** - Clean separation of data items from UI elements with proper index mapping
- **Selection UI** - Visual selection indicators with checkboxes/overlays
- **Multi-Select Operations** - Bulk actions on selected items (delete, download, etc.)
- **Drag & Drop Reordering** - Rearrange gallery items with drag and drop

### Planned Enhancements
- **Custom Placeholder Templates** - RenderFragment support for custom placeholder UI
- **Multi-Placeholder Support** - Multiple placeholder types in a single gallery
- **Placeholder Event System** - Type-specific event callbacks for placeholder interactions
- **Edit Mode Toggle** - Dynamic switching between read-only and edit modes
- **Advanced Keyboard Shortcuts** - Ctrl+Click, Shift+Click for selection

### Future Considerations
- Server-side image processing integration
- Cloud storage provider integrations
- Advanced image editing capabilities
- Collaborative gallery features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite: `cd tests && npm test`  
5. Submit a pull request

## License

This project is licensed under the MIT License.