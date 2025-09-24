# PhotoSwipe.Blazor

A comprehensive Blazor component library that wraps [PhotoSwipe](https://photoswipe.com/) and extends it with upload capabilities, image processing, and enhanced gallery management features.

## Features

### Core Features
- 🖼️ Responsive image galleries with lightbox
- ⚡ Lightweight and fast performance
- 📱 Mobile-friendly with touch support
- 🎨 Customizable styling with CSS isolation
- 🔧 Strongly-typed configuration
- 🎯 Event handling support
- ♿ Accessibility features

### Extended Features  
- 📤 Drag & drop file uploads
- 🖼️ Client-side image processing and resizing
- ✅ File validation (size, type)
- 👁️ Upload preview before confirmation
- 🔄 Add or replace gallery modes
- 📊 Upload progress indicators
- ⚠️ Comprehensive error handling

## Requirements

- .NET 8.0 or .NET 9.0
- Blazor Server or Blazor WebAssembly

## Installation

Add the package reference to your Blazor project:

```xml
<PackageReference Include="PhotoSwipe.Blazor" Version="1.0.0" />
```

Register the services in your `Program.cs`:

```csharp
builder.Services.AddPhotoSwipeBlazor();
```

Include the CSS in your `_Layout.cshtml` (Blazor Server) or `index.html` (Blazor WebAssembly):

```html
<link href="_content/PhotoSwipe.Blazor/css/photoswipe.css" rel="stylesheet" />
```

## Usage

### Basic Gallery

```razor
@using PhotoSwipe.Blazor.Components
@using PhotoSwipe.Blazor.Models

<PhotoSwipeGallery Items="@images" />

@code {
    private List<PhotoSwipeItem> images = new()
    {
        new PhotoSwipeItem
        {
            Src = "/images/photo1.jpg",
            ThumbnailUrl = "/images/thumb1.jpg",
            Width = 1024,
            Height = 768,
            Alt = "Beautiful landscape"
        },
        new PhotoSwipeItem
        {
            Src = "/images/photo2.jpg",
            ThumbnailUrl = "/images/thumb2.jpg",
            Width = 800,
            Height = 600,
            Alt = "City skyline"
        }
    };
}
```

### Gallery with Custom Template

```razor
<PhotoSwipeGallery Items="@images">
    <ItemTemplate Context="item">
        <div class="custom-thumbnail">
            <img src="@item.ThumbnailUrl" alt="@item.Alt" />
            <div class="overlay">
                <h4>@item.Title</h4>
                <p>@item.Caption</p>
            </div>
        </div>
    </ItemTemplate>
</PhotoSwipeGallery>
```

### Lightbox with Triggers

```razor
<PhotoSwipeLightbox Items="@images">
    <TriggerTemplate Context="item">
        <button class="custom-trigger">
            <img src="@item.ThumbnailUrl" alt="@item.Alt" />
            <span>View @item.Title</span>
        </button>
    </TriggerTemplate>
</PhotoSwipeLightbox>
```

### Configuration Options

```razor
<PhotoSwipeGallery Items="@images" Options="@options" />

@code {
    private PhotoSwipeOptions options = new()
    {
        ShowHideAnimationType = "fade",
        ShowAnimationDuration = 500,
        BackgroundOpacity = 0.9,
        Loop = true,
        WheelToZoom = true,
        MaxZoomLevel = 3.0
    };
}
```

### Event Handling

```razor
<PhotoSwipeGallery Items="@images" 
                   OnOpen="OnGalleryOpen" 
                   OnClose="OnGalleryClose" 
                   OnChange="OnImageChange" />

@code {
    private void OnGalleryOpen(PhotoSwipeEventArgs args)
    {
        Console.WriteLine($"Gallery opened at index {args.Event.Index}");
    }

    private void OnGalleryClose(PhotoSwipeEventArgs args)
    {
        Console.WriteLine("Gallery closed");
    }

    private void OnImageChange(PhotoSwipeEventArgs args)
    {
        Console.WriteLine($"Changed to image {args.Event.Index}");
    }
}
```

## PhotoSwipeItem Properties

| Property | Type | Description |
|----------|------|-------------|
| `Src` | `string` | Full-size image URL |
| `ThumbnailUrl` | `string?` | Thumbnail image URL (optional) |
| `Width` | `int` | Image width in pixels |
| `Height` | `int` | Image height in pixels |
| `Alt` | `string?` | Alt text for accessibility |
| `Caption` | `string?` | Image caption |
| `Title` | `string?` | Image title |
| `ThumbnailClass` | `string?` | CSS class for thumbnail |
| `Data` | `object?` | Custom data object |

## PhotoSwipeOptions

The `PhotoSwipeOptions` class provides strongly-typed access to all PhotoSwipe configuration options:

- **Animation**: `ShowHideAnimationType`, `ShowAnimationDuration`, `HideAnimationDuration`
- **Appearance**: `BackgroundOpacity`, `Spacing`
- **Interaction**: `AllowPanToNext`, `Loop`, `PinchToClose`, `WheelToZoom`
- **Zoom**: `MaxZoomLevel`, `InitialZoomLevel`, `SecondaryZoomLevel`
- **Accessibility**: `EscKey`, `ArrowKeys`, `ReturnFocus`, `TrapFocus`
- **UI**: `Counter`, `CloseTitle`, `ZoomTitle`, `ErrorMessage`

## CSS Customization

The components use CSS isolation, but you can override styles globally:

```css
.photoswipe-gallery {
    gap: 20px;
    padding: 20px;
}

.photoswipe-item {
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.photoswipe-item:hover {
    transform: scale(1.02);
}
```

## PhotoSwipeUploadGallery Component

The `PhotoSwipeUploadGallery` extends the base gallery with comprehensive upload functionality:

### Basic Upload Gallery

```razor
@using PhotoSwipe.Blazor.Components
@using PhotoSwipe.Blazor.Models

<PhotoSwipeUploadGallery 
    Items="@images"
    MaxFileSize="@(10 * 1024 * 1024)"  // 10MB limit
    MaxFiles="20"
    AllowMultiSelect="true"
    OnItemsChanged="@OnGalleryChanged"
    OnItemsUploaded="@OnItemsUploaded" />

@code {
    private List<PhotoSwipeItem> images = new();
    
    private void OnGalleryChanged(IEnumerable<PhotoSwipeItem> items)
    {
        images = items.ToList();
        StateHasChanged();
    }
    
    private void OnItemsUploaded(IEnumerable<PhotoSwipeItem> uploadedItems)
    {
        Console.WriteLine($"Uploaded {uploadedItems.Count()} new images");
    }
}
```

### Upload Gallery with Custom Templates

```razor
<PhotoSwipeUploadGallery 
    Items="@images"
    UploadMode="PhotoSwipeUploadMode.Add"
    MaxFileSize="@(15 * 1024 * 1024)">
    <ItemTemplate Context="item">
        <div class="custom-upload-item">
            <img src="@item.ThumbnailUrl" alt="@item.Alt" />
            <div class="overlay">
                <span>@item.Title</span>
                <span>@($"{item.Width}×{item.Height}")</span>
            </div>
        </div>
    </ItemTemplate>
</PhotoSwipeUploadGallery>
```

### Upload Gallery Properties

| Property | Type | Description |
|----------|------|-------------|
| `Items` | `IEnumerable<PhotoSwipeItem>` | Current gallery items |
| `UploadMode` | `PhotoSwipeUploadMode` | Add or Replace mode |
| `MaxFileSize` | `long` | Maximum file size in bytes (default: 10MB) |
| `MaxFiles` | `int` | Maximum number of files per upload (default: 20) |
| `AllowMultipleFiles` | `bool` | Enable multiple file selection (default: true) |
| `AllowAdd` | `bool` | Enable upload functionality (default: true) |
| `AllowDelete` | `bool` | Enable delete functionality (default: false) |
| `EnableSelection` | `bool` | Enable item selection (default: false) |
| `AllowMultiSelect` | `bool` | Enable multiple item selection (default: true) |
| `SelectedItem` | `PhotoSwipeItem?` | Currently selected single item |
| `SelectedItems` | `IEnumerable<PhotoSwipeItem>?` | Currently selected multiple items |
| `CustomOverlayControls` | `RenderFragment<PhotoSwipeItem>?` | Custom overlay controls template |

### Upload Gallery Events

| Event | Type | Description |
|-------|------|-------------|
| `OnOpen` | `EventCallback<PhotoSwipeEventArgs>` | Fired when lightbox opens |
| `OnClose` | `EventCallback<PhotoSwipeEventArgs>` | Fired when lightbox closes |
| `OnChange` | `EventCallback<PhotoSwipeEventArgs>` | Fired when lightbox slide changes |
| `OnItemsChanged` | `EventCallback<IEnumerable<PhotoSwipeItem>>` | Fired when gallery items change |
| `OnItemsUploaded` | `EventCallback<IEnumerable<PhotoSwipeItem>>` | Fired after successful upload |
| `OnItemDeleted` | `EventCallback<PhotoSwipeItem>` | Fired when single item is deleted |
| `OnItemsDeleted` | `EventCallback<IEnumerable<PhotoSwipeItem>>` | Fired when multiple items are deleted |
| `SelectedItemChanged` | `EventCallback<PhotoSwipeItem>` | Fired when single selection changes |
| `SelectedItemsChanged` | `EventCallback<IEnumerable<PhotoSwipeItem>>` | Fired when multiple selection changes |

## Advanced Usage

### Programmatic Control

```razor
<PhotoSwipeGallery @ref="galleryRef" Items="@images" />
<button @onclick="() => galleryRef?.OpenAsync(2)">Open at index 2</button>

@code {
    private PhotoSwipeGallery? galleryRef;
}
```

### Dynamic Updates

```razor
<PhotoSwipeGallery Items="@images" />
<button @onclick="AddImage">Add Image</button>

@code {
    private void AddImage()
    {
        images.Add(new PhotoSwipeItem
        {
            Src = $"/images/photo{images.Count + 1}.jpg",
            Width = 800,
            Height = 600,
            Alt = $"Photo {images.Count + 1}"
        });
        StateHasChanged();
    }
}
```

### Upload Mode Control

```razor
<PhotoSwipeUploadGallery 
    Items="@images"
    UploadMode="@currentMode"
    OnItemsChanged="@OnGalleryChanged">
</PhotoSwipeUploadGallery>

<div class="mode-selector">
    <label>
        <input type="radio" checked="@(currentMode == PhotoSwipeUploadMode.Add)" 
               @onchange="@(() => currentMode = PhotoSwipeUploadMode.Add)" />
        Add to Gallery
    </label>
    <label>
        <input type="radio" checked="@(currentMode == PhotoSwipeUploadMode.Replace)" 
               @onchange="@(() => currentMode = PhotoSwipeUploadMode.Replace)" />
        Replace Gallery
    </label>
</div>

@code {
    private PhotoSwipeUploadMode currentMode = PhotoSwipeUploadMode.Add;
}
```

## License

This project is licensed under the MIT License. PhotoSwipe is licensed under the MIT License.