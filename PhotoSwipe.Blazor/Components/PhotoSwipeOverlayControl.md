# PhotoSwipeOverlayControl Component

The `PhotoSwipeOverlayControl` component provides a generic, reusable solution for adding clickable overlay controls to PhotoSwipe galleries. It solves the common problem of preventing PhotoSwipe gallery opening when users click on overlay elements like delete buttons, selection controls, or custom actions.

## Key Features

- **Generic and Reusable**: Works with any type of overlay control
- **Data-Attribute Based**: Uses modern HTML5 data attributes for reliable click prevention
- **Accessible**: Built-in ARIA labels, keyboard support, and screen reader compatibility
- **Customizable**: Extensive styling options and positioning controls
- **Framework Integrated**: Seamless integration with PhotoSwipe's `clickedIndex` filter

## Quick Start

### Basic Delete Button
```razor
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopRight"
                         ControlType="delete"
                         Icon="×"
                         Title="Delete image"
                         OnClick="@(() => DeleteItem(item))" />
```

### Selection Checkbox
```razor
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopLeft"
                         ControlType="selection">
    <input type="checkbox"
           checked="@IsSelected(item)"
           @onchange="@(e => ToggleSelection(item, (bool)e.Value!))" />
</PhotoSwipeOverlayControl>
```

### Custom Control with Icon
```razor
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.BottomRight"
                         ControlType="favorite"
                         Icon="♡"
                         Title="Add to favorites"
                         ButtonCssClass="heart-button"
                         OnClick="@(() => ToggleFavorite(item))" />
```

## Component Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `Position` | `OverlayPosition` | `TopRight` | Position of the overlay control |
| `ControlType` | `string` | `"custom"` | Semantic type identifier |
| `Icon` | `string?` | `null` | Icon content (text, emoji, or HTML) |
| `ChildContent` | `RenderFragment?` | `null` | Custom child content (overrides Icon) |
| `OnClick` | `EventCallback<MouseEventArgs>` | - | Click event handler |
| `PreventDefault` | `bool` | `true` | Prevent default browser behavior |
| `StopPropagation` | `bool` | `true` | Stop event bubbling |
| `Disabled` | `bool` | `false` | Whether control is disabled |
| `Title` | `string?` | `null` | Tooltip text |
| `AriaLabel` | `string?` | `null` | Accessibility label |
| `CssClass` | `string?` | `null` | Additional container CSS classes |
| `ButtonCssClass` | `string?` | `null` | Additional button CSS classes |
| `Offset` | `string?` | `null` | Custom positioning offset |
| `CustomPosition` | `string?` | `null` | Override positioning with custom CSS |

## Positioning Options

The component supports flexible positioning through the `OverlayPosition` enum:

- `TopLeft`, `TopRight`, `TopCenter`
- `BottomLeft`, `BottomRight`, `BottomCenter`
- `CenterLeft`, `CenterRight`, `Center`
- `Custom` (use with `CustomPosition` parameter)

### Custom Positioning Examples

```razor
<!-- Custom offset from edge -->
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopRight"
                         Offset="16px" />

<!-- Completely custom positioning -->
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.Custom"
                         CustomPosition="top: 50%; left: 20px; transform: translateY(-50%);" />
```

## Styling and Theming

The component uses CSS custom properties for comprehensive theming:

```css
:root {
    /* Base overlay theme */
    --pswp-overlay-bg: rgba(0, 0, 0, 0.7);
    --pswp-overlay-bg-hover: rgba(0, 0, 0, 0.85);
    --pswp-overlay-text: white;
    --pswp-overlay-size: 32px;
    --pswp-overlay-font-size: 14px;
    --pswp-overlay-offset: 8px;
    --pswp-overlay-border-radius: 6px;

    /* Control-specific colors */
    --pswp-overlay-delete-bg: rgba(220, 53, 69, 0.9);
    --pswp-overlay-selection-bg: rgba(13, 110, 253, 0.9);
    --pswp-overlay-custom-bg: rgba(108, 117, 125, 0.9);
}
```

### Style Variants

```razor
<!-- Size variants -->
<PhotoSwipeOverlayControl ButtonCssClass="size-small" />
<PhotoSwipeOverlayControl ButtonCssClass="size-large" />

<!-- Shape variants -->
<PhotoSwipeOverlayControl ButtonCssClass="shape-square" />
<PhotoSwipeOverlayControl ButtonCssClass="shape-circle" />

<!-- Theme variants -->
<PhotoSwipeOverlayControl ButtonCssClass="theme-light" />
<PhotoSwipeOverlayControl ButtonCssClass="theme-transparent" />
```

## How It Works

### Data Attribute System

The component automatically applies data attributes that are recognized by PhotoSwipe's enhanced `clickedIndex` filter:

- `data-pswp-overlay-control="true"` - Identifies overlay controls
- `data-pswp-control-type="[type]"` - Semantic control type
- `data-pswp-prevent-gallery="true"` - Explicit prevention marker

### JavaScript Integration

The enhanced PhotoSwipe wrapper (`photoswipe-simple.js`) includes a sophisticated click filter:

```javascript
lightbox.addFilter('clickedIndex', (clickedIndex, e) => {
    // Check for data-attribute based controls (primary method)
    if (e.target.closest('[data-pswp-overlay-control="true"]') ||
        e.target.closest('[data-pswp-prevent-gallery="true"]')) {
        return -1; // Prevents gallery opening
    }
    return clickedIndex;
});
```

## Real-World Examples

### Photo Management Gallery

```razor
<PhotoSwipeGallery Items="@photos">
    <ItemTemplate Context="photo">
        <div class="photo-item">
            <!-- Selection control -->
            <PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopLeft"
                                     ControlType="selection"
                                     CssClass="selection-control">
                <input type="checkbox"
                       checked="@selectedPhotos.Contains(photo.Id)"
                       @onchange="@(e => ToggleSelection(photo, (bool)e.Value!))" />
            </PhotoSwipeOverlayControl>

            <!-- Delete control -->
            <PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopRight"
                                     ControlType="delete"
                                     Icon="🗑️"
                                     Title="Delete photo"
                                     OnClick="@(() => DeletePhoto(photo))" />

            <!-- Favorite control -->
            <PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.BottomRight"
                                     ControlType="favorite"
                                     Icon="@(photo.IsFavorite ? "♥" : "♡")"
                                     Title="@(photo.IsFavorite ? "Remove from favorites" : "Add to favorites")"
                                     ButtonCssClass="@(photo.IsFavorite ? "favorited" : "")"
                                     OnClick="@(() => ToggleFavorite(photo))" />

            <!-- Share control -->
            <PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.BottomLeft"
                                     ControlType="share"
                                     Icon="📤"
                                     Title="Share photo"
                                     OnClick="@(() => SharePhoto(photo))" />

            <img src="@photo.ThumbnailUrl" alt="@photo.Description" />
        </div>
    </ItemTemplate>
</PhotoSwipeGallery>
```

### Custom HTML Content

```razor
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopCenter"
                         ControlType="info">
    <div class="photo-info-overlay">
        <span class="photo-rating">⭐ @photo.Rating</span>
        <span class="photo-date">@photo.DateTaken.ToString("MMM yyyy")</span>
    </div>
</PhotoSwipeOverlayControl>
```

### Multi-Action Dropdown

```razor
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopRight"
                         ControlType="menu"
                         CssClass="photo-menu">
    <div class="dropdown">
        <button class="dropdown-toggle">⋮</button>
        <div class="dropdown-menu">
            <button @onclick="@(() => DownloadPhoto(photo))">Download</button>
            <button @onclick="@(() => EditPhoto(photo))">Edit</button>
            <button @onclick="@(() => ReportPhoto(photo))">Report</button>
        </div>
    </div>
</PhotoSwipeOverlayControl>
```

## Accessibility Features

- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: All controls are focusable and keyboard accessible
- **High Contrast**: Automatic adaptation for high contrast mode
- **Touch Targets**: Mobile-optimized touch target sizes

## Browser Support

- Modern browsers with CSS custom properties support
- Graceful degradation for older browsers
- Mobile-responsive design out of the box

## Migration from Legacy Approach

If you're upgrading from the hardcoded overlay approach, replace:

```razor
<!-- Old approach -->
<div class="delete-overlay">
    <button class="btn-delete-item" @onclick="Delete">×</button>
</div>
```

With:

```razor
<!-- New approach -->
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopRight"
                         ControlType="delete"
                         Icon="×"
                         Title="Delete image"
                         OnClick="Delete" />
```

The new approach provides better reliability, accessibility, and maintainability while maintaining backward compatibility with existing CSS.

## Best Practices

1. **Use Semantic ControlType**: Choose meaningful control type values for debugging and styling
2. **Provide Tooltips**: Always include `Title` attributes for user guidance
3. **Consider Mobile**: Test overlay controls on touch devices
4. **Accessibility First**: Include proper ARIA labels for screen readers
5. **Performance**: Avoid too many overlay controls on a single item
6. **Consistent Positioning**: Use consistent positioning patterns across your application

## Troubleshooting

### Gallery Still Opens When Clicking Controls

- Ensure the component is properly nested within gallery items
- Check that `PreventDefault` and `StopPropagation` are true
- Verify that `photoswipe-simple.js` is loaded and updated

### Styling Issues

- Check CSS custom properties are defined in your application
- Ensure component CSS is loaded after PhotoSwipe CSS
- Use browser dev tools to inspect generated data attributes

### Mobile Touch Issues

- Increase touch target sizes using the `size-large` CSS class
- Test on actual devices, not just browser dev tools
- Consider touch delay and gesture conflicts