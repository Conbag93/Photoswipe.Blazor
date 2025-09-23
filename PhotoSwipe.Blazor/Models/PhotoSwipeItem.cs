using PhotoSwipe.Blazor.Components;

namespace PhotoSwipe.Blazor.Models;

public class PhotoSwipeItem
{
    public string Src { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Alt { get; set; }
    public string? Caption { get; set; }
    public string? Title { get; set; }
    public string? ThumbnailClass { get; set; }
    public string? SrcSet { get; set; }
    public object? Data { get; set; }

    /// <summary>
    /// Custom data object that can contain any additional metadata for this item.
    /// Used by placeholders to store identification and configuration data.
    /// </summary>
    public object? CustomData { get; set; }

    /// <summary>
    /// Number of grid columns this item should span (default: 1).
    /// Used for CSS Grid layouts to create varied item sizes.
    /// </summary>
    public int GridColumnSpan { get; set; } = 1;

    /// <summary>
    /// Number of grid rows this item should span (default: 1).
    /// Used for CSS Grid layouts to create varied item sizes.
    /// </summary>
    public int GridRowSpan { get; set; } = 1;

    /// <summary>
    /// Custom CSS class to apply to this specific grid item.
    /// Combined with ThumbnailClass for additional styling flexibility.
    /// </summary>
    public string? GridItemClass { get; set; }

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