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
- **Built-in Label System** - Add positioned overlay labels to images without custom templates
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
        new() {
            Src = "/images/photo1.jpg",
            Width = 1024,
            Height = 768,
            ThumbnailUrl = "/images/thumb1.jpg",
            Label = "🏖️ Beach",
            LabelPosition = PhotoSwipeOverlayControl.OverlayPosition.TopLeft
        },
        new() {
            Src = "/images/photo2.jpg",
            Width = 1200,
            Height = 800,
            ThumbnailUrl = "/images/thumb2.jpg",
            Label = "🏗️ Architecture",
            LabelPosition = PhotoSwipeOverlayControl.OverlayPosition.TopRight
        }
    };
}
```

## Error Handling

PhotoSwipe.Blazor provides comprehensive error handling for file uploads and processing, with special detection for common issues like cloud storage files (OneDrive, Google Drive).

### Error Types

The library categorizes errors to help you provide better user experiences:

```csharp
public enum PhotoSwipeErrorType
{
    InvalidFileType,        // Unsupported file format
    FileSizeTooLarge,       // File exceeds size limit
    StreamReadFailure,      // Cannot read file (often cloud storage)
    ProcessingFailure,      // Error during image processing
    DimensionDetectionFailure, // Cannot detect image dimensions (non-fatal)
    Unknown                 // Uncategorized error
}
```

### Handling Upload Errors

PhotoSwipe.Blazor provides two callback mechanisms for error handling:

1. **Per-File Error Callback** - Invoked immediately when each file fails
2. **Upload Complete Callback** - Invoked when all files are processed, with full results

```csharp
<PhotoSwipeUploadGallery Items="@_items"
                         AllowAdd="true"
                         OnFileError="@HandleFileError"
                         OnUploadComplete="@HandleUploadComplete"
                         OnItemsUploaded="@HandleItemsUploaded" />

@code {
    private List<PhotoSwipeItem> _items = new();

    private void HandleFileError(PhotoSwipeFileError error)
    {
        // Handle individual file errors as they occur
        Console.WriteLine($"❌ {error.FileName}: {error.Message}");

        // Check for cloud storage issues
        if (error.IsCloudStorageIssue)
        {
            ShowToast("Please download the file locally first before uploading.");
        }

        // Show suggested action to user
        Console.WriteLine($"💡 {error.SuggestedAction}");
    }

    private void HandleUploadComplete(PhotoSwipeUploadResult result)
    {
        // Handle batch upload results
        Console.WriteLine($"Upload complete: {result.SuccessfulItems.Count} succeeded, {result.Errors.Count} failed");

        if (result.HasErrors)
        {
            // Display summary of errors
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"  - {error.FileName}: {error.ErrorType}");
            }
        }

        // Success rate
        Console.WriteLine($"Success rate: {result.SuccessRate:F1}%");
    }

    private void HandleItemsUploaded(IEnumerable<PhotoSwipeItem> items)
    {
        // Handle successfully uploaded items
        _items.AddRange(items);
    }
}
```

### PhotoSwipeFileError Properties

Each error provides detailed context for debugging and user messaging:

```csharp
public class PhotoSwipeFileError
{
    public string FileName { get; }           // Original file name
    public long FileSize { get; }             // File size in bytes
    public string ContentType { get; }        // MIME type
    public PhotoSwipeErrorType ErrorType { get; }
    public string Message { get; }            // User-friendly message
    public string? ExceptionType { get; }     // C# exception type (for debugging)
    public string? StackTrace { get; }        // Full stack trace (for debugging)
    public Dictionary<string, object> AdditionalData { get; }
    public DateTime Timestamp { get; }

    // Helper properties
    public bool IsCloudStorageIssue { get; }  // Detected cloud storage issue
    public string SuggestedAction { get; }    // Recommended user action
}
```

### Cloud Storage Detection

The library automatically detects when files fail due to cloud storage issues (common with OneDrive, Google Drive):

```csharp
private void HandleFileError(PhotoSwipeFileError error)
{
    if (error.IsCloudStorageIssue)
    {
        // Show specific guidance for cloud storage files
        await ShowDialog(
            title: "Cloud Storage File Detected",
            message: "This file appears to be stored in cloud storage (OneDrive, Google Drive, etc.). " +
                     "Please download it to your local computer first, then try uploading again.",
            icon: "☁️"
        );
    }
}
```

### Upload Result Summary

The `PhotoSwipeUploadResult` provides a complete summary of batch uploads:

```csharp
public class PhotoSwipeUploadResult
{
    public IReadOnlyList<PhotoSwipeItem> SuccessfulItems { get; }
    public IReadOnlyList<PhotoSwipeFileError> Errors { get; }
    public int TotalProcessed { get; }       // Total files processed
    public bool HasErrors { get; }           // Any errors occurred
    public bool HasSuccessfulItems { get; }  // Any files succeeded
    public double SuccessRate { get; }       // Percentage (0-100)
}
```

### Programmatic Error Handling with Try* Methods

For advanced scenarios, you can use the `ImageProcessingService` Try* methods directly:

```csharp
@inject ImageProcessingService ImageProcessor

private async Task ProcessFileWithCustomHandling(IBrowserFile file)
{
    var (item, error) = await ImageProcessor.TryProcessImageFileAsync(file, maxSizeBytes: 5_000_000);

    if (item != null)
    {
        // Success - add to gallery
        _items.Add(item);
        Console.WriteLine($"✅ Processed: {item.Title}");
    }
    else if (error != null)
    {
        // Handle specific error types
        switch (error.ErrorType)
        {
            case PhotoSwipeErrorType.StreamReadFailure:
                await HandleCloudStorageError(error);
                break;
            case PhotoSwipeErrorType.FileSizeTooLarge:
                await OfferCompression(file);
                break;
            case PhotoSwipeErrorType.InvalidFileType:
                await ShowSupportedFormats();
                break;
            default:
                await ShowGenericError(error.Message);
                break;
        }
    }
}
```

### Error Display in UI

The `PhotoSwipeUploadArea` component displays errors with helpful context automatically:

- **Error icon and filename** - Clear visual identification
- **Error type badge** - Shows the category of error
- **User-friendly message** - Plain English explanation
- **Suggested action** - What the user should do next
- **Cloud storage hint** - Special guidance for detected cloud storage issues

Errors can be cleared individually or all at once via the UI.

### Troubleshooting Common Issues

#### OneDrive/Google Drive Files

**Problem:** Files stored in cloud storage fail with `StreamReadFailure`

**Solution:**
- Download files to local computer first
- Use the "Save to Downloads" option before uploading
- Check if file shows a cloud icon in File Explorer

#### Large Files

**Problem:** `FileSizeTooLarge` errors

**Solution:**
```csharp
<PhotoSwipeUploadGallery MaxFileSize="@(20 * 1024 * 1024)" /> <!-- 20MB -->
```

#### Unsupported File Types

**Problem:** `InvalidFileType` errors

**Solution:**
```csharp
<PhotoSwipeUploadGallery AllowDocuments="true" /> <!-- Allow PDF, DOCX, etc. -->
```

Or check supported types:
```csharp
var supportedTypes = ImageProcessingService.GetSupportedTypes(); // ["JPEG", "PNG", "GIF", "WebP"]
var allSupportedTypes = ImageProcessingService.GetAllSupportedTypes(); // Includes documents
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

### PhotoSwipeItem Model

#### Core Properties

```csharp
public class PhotoSwipeItem
{
    // Image properties
    public string Src { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Alt { get; set; }
    public string? Caption { get; set; }
    public string? Title { get; set; }
    public string? SrcSet { get; set; }

    // CSS and styling
    public string? ThumbnailClass { get; set; }
    public string? GridItemClass { get; set; }

    // Grid layout control
    public int GridColumnSpan { get; set; } = 1;
    public int GridRowSpan { get; set; } = 1;

    // Metadata
    public object? Data { get; set; }
    public object? CustomData { get; set; }
}
```

#### Built-in Label System

PhotoSwipe.Blazor includes a comprehensive label system that allows you to add positioned overlay labels to gallery images without requiring custom templates:

```csharp
public class PhotoSwipeItem
{
    /// <summary>
    /// Label text to display as an overlay on the thumbnail image.
    /// If null or empty, no label is displayed.
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Position for the label overlay. Uses the same positioning system as PhotoSwipeOverlayControl.
    /// Default: TopRight
    /// </summary>
    public PhotoSwipeOverlayControl.OverlayPosition LabelPosition { get; set; } = PhotoSwipeOverlayControl.OverlayPosition.TopRight;

    /// <summary>
    /// Custom CSS class to apply to the label element.
    /// Can be used for custom styling beyond the default label appearance.
    /// </summary>
    public string? LabelCssClass { get; set; }

    /// <summary>
    /// Inline styles to apply to the label element.
    /// For advanced styling scenarios that require specific CSS properties.
    /// </summary>
    public string? LabelStyle { get; set; }
}
```

#### Available Label Positions

The label positioning uses the PhotoSwipeOverlayControl positioning system:

```csharp
public enum OverlayPosition
{
    TopLeft,      // Top-left corner
    TopRight,     // Top-right corner (default)
    TopCenter,    // Top center
    BottomLeft,   // Bottom-left corner
    BottomRight,  // Bottom-right corner
    BottomCenter, // Bottom center
    CenterLeft,   // Center left
    CenterRight,  // Center right
    Center        // Absolute center
}
```

#### Label Usage Examples

**Basic Labels:**
```csharp
var galleryItems = new List<PhotoSwipeItem>
{
    new() {
        Src = "/images/beach.jpg",
        Width = 1024, Height = 768,
        Label = "🏖️ Beach",
        LabelPosition = PhotoSwipeOverlayControl.OverlayPosition.TopLeft
    },
    new() {
        Src = "/images/mountain.jpg",
        Width = 1200, Height = 800,
        Label = "⛰️ Mountain",
        LabelPosition = PhotoSwipeOverlayControl.OverlayPosition.BottomRight
    }
};
```

**Custom Styled Labels:**
```csharp
new PhotoSwipeItem {
    Src = "/images/architecture.jpg",
    Width = 1024, Height = 768,
    Label = "Featured",
    LabelPosition = PhotoSwipeOverlayControl.OverlayPosition.TopRight,
    LabelCssClass = "featured-label",
    LabelStyle = "background: linear-gradient(45deg, #ff6b6b, #4ecdc4); font-weight: bold;"
}
```

**Complex Labels with HTML Entities:**
```csharp
new PhotoSwipeItem {
    Src = "/images/sunset.jpg",
    Width = 1024, Height = 768,
    Label = "★★★★★", // Unicode stars
    LabelPosition = PhotoSwipeOverlayControl.OverlayPosition.BottomCenter,
    LabelCssClass = "rating-label"
}
```

#### Label CSS Customization

The built-in label styles provide a solid foundation that can be customized:

```css
/* Default label styles (built-in) */
.photoswipe-item-label {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    backdrop-filter: blur(4px);
    pointer-events: none;
    z-index: 2;
    white-space: nowrap;
}

/* Custom label styles (your application) */
.featured-label {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

.rating-label {
    background: rgba(255, 215, 0, 0.9) !important;
    color: #333 !important;
    font-size: 0.875rem !important;
}
```

#### Responsive Label Behavior

Labels automatically adjust for mobile devices:

- **Desktop**: Full padding and font size
- **Tablet** (≤768px): Slightly reduced padding
- **Mobile** (≤600px): Smaller font size and tighter spacing
- **Small Mobile** (≤375px): Minimal font size and padding

#### Label vs. Caption Comparison

| Feature | Label | Caption |
|---------|-------|---------|
| **Position** | Overlay on thumbnail | Below image in lightbox |
| **Visibility** | Always visible on thumbnail | Only visible in lightbox |
| **Positioning** | 9 predefined positions | Fixed below image |
| **Styling** | Highly customizable | PhotoSwipe's caption styling |
| **Purpose** | Category, status, rating | Detailed description |
| **Template Required** | No | No |

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