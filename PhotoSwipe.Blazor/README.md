# PhotoSwipe.Blazor

A Blazor component library that provides a responsive image gallery using [PhotoSwipe](https://photoswipe.com/).

## Features

- 🖼️ Responsive image galleries
- ⚡ Lightweight and fast
- 📱 Mobile-friendly with touch support
- 🎨 Customizable styling with CSS isolation
- 🔧 Strongly-typed configuration
- 🎯 Event handling support
- ♿ Accessibility features

## Installation

Add the package reference to your Blazor project:

```xml
<PackageReference Include="PhotoSwipe.Blazor" Version="1.0.0" />
```

Include the CSS in your `_Layout.cshtml` or `index.html`:

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

## License

This project is licensed under the MIT License. PhotoSwipe is licensed under the MIT License.