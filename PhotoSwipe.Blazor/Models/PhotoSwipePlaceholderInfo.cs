namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Contains metadata and configuration for a PhotoSwipe gallery placeholder.
/// Placeholders are UI-only elements that provide interactive functionality
/// without being part of the actual gallery data.
/// </summary>
public class PhotoSwipePlaceholderInfo
{
    /// <summary>
    /// The type of placeholder (Upload, SeeMore, etc.)
    /// </summary>
    public PhotoSwipePlaceholderType Type { get; set; }

    /// <summary>
    /// The position where this placeholder should appear in the gallery
    /// </summary>
    public PhotoSwipeContainedUploadPosition Position { get; set; } = PhotoSwipeContainedUploadPosition.Last;

    /// <summary>
    /// Unique identifier for this placeholder instance
    /// </summary>
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];

    /// <summary>
    /// Text to display in the placeholder (e.g., "Add Images", "See More")
    /// </summary>
    public string? Text { get; set; } = "Add files...";

    /// <summary>
    /// CSS classes to apply to the placeholder element
    /// </summary>
    public string? CssClass { get; set; }

    /// <summary>
    /// Custom data that can be used by specific placeholder types
    /// </summary>
    public object? CustomData { get; set; }

    /// <summary>
    /// Whether this placeholder is currently enabled/visible
    /// </summary>
    public bool IsEnabled { get; set; } = true;

    /// <summary>
    /// Creates a PhotoSwipeItem that represents this placeholder for rendering purposes.
    /// The returned item has special properties to identify it as a placeholder.
    /// </summary>
    public PhotoSwipeItem ToDisplayItem()
    {
        return new PhotoSwipeItem
        {
            Src = GetPlaceholderImageData(),
            ThumbnailUrl = GetPlaceholderImageData(),
            Width = 150,
            Height = 150,
            Alt = Text ?? $"{Type} placeholder",
            Title = Text,
            Caption = $"placeholder-{Type.ToString().ToLowerInvariant()}",
            CustomData = new {
                IsPlaceholder = true,
                PlaceholderType = Type,
                PlaceholderId = Id
            }
        };
    }

    /// <summary>
    /// Gets the base64-encoded SVG data for this placeholder type
    /// </summary>
    private string GetPlaceholderImageData()
    {
        return Type switch
        {
            PhotoSwipePlaceholderType.Upload => GetUploadPlaceholderSvg(),
            PhotoSwipePlaceholderType.SeeMore => GetSeeMorePlaceholderSvg(),
            PhotoSwipePlaceholderType.Pagination => GetPaginationPlaceholderSvg(),
            PhotoSwipePlaceholderType.LoadMore => GetLoadMorePlaceholderSvg(),
            _ => GetDefaultPlaceholderSvg()
        };
    }

    private string GetUploadPlaceholderSvg()
    {
        var stylishSvg = @"
<svg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#f8f9fa'/>
      <stop offset='50%' stop-color='#e9ecef'/>
      <stop offset='100%' stop-color='#dee2e6'/>
    </linearGradient>
    <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
      <feDropShadow dx='0' dy='2' stdDeviation='3' flood-color='rgba(0,0,0,0.2)'/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width='200' height='200' fill='url(#bg)' rx='12'/>

  <!-- File stack effect with three stacked files -->
  <g transform='translate(100,70)'>
    <!-- Back file (darkest) -->
    <g transform='translate(-8,8)' opacity='0.6'>
      <rect x='-20' y='-25' width='40' height='50' fill='#6c757d' rx='3'/>
      <path d='M12,-25 L12,-19 L18,-19 L12,-25 Z' fill='#495057'/>
    </g>

    <!-- Middle file (medium) -->
    <g transform='translate(-4,4)' opacity='0.8'>
      <rect x='-20' y='-25' width='40' height='50' fill='#6c757d' rx='3'/>
      <path d='M12,-25 L12,-19 L18,-19 L12,-25 Z' fill='#495057'/>
    </g>

    <!-- Front file (lightest) -->
    <g transform='translate(0,0)' opacity='1.0'>
      <rect x='-20' y='-25' width='40' height='50' fill='#6c757d' rx='3'/>
      <path d='M12,-25 L12,-19 L18,-19 L12,-25 Z' fill='#495057'/>
    </g>
  </g>

  <!-- Plus sign (positioned below files) -->
  <g transform='translate(100,120)' filter='url(#shadow)'>
    <circle cx='0' cy='0' r='8' fill='#6c757d' opacity='0.9'/>
    <path d='M-4,0 L4,0 M0,-4 L0,4' stroke='#ffffff' stroke-width='2' stroke-linecap='round'/>
  </g>
</svg>";

        var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(stylishSvg));
        return $"data:image/svg+xml;base64,{base64}";
    }

    private string GetSeeMorePlaceholderSvg()
    {
        var svg = @"
<svg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#f8f9fa'/>
      <stop offset='50%' stop-color='#e9ecef'/>
      <stop offset='100%' stop-color='#dee2e6'/>
    </linearGradient>
  </defs>
  <rect width='200' height='200' fill='url(#bg)' rx='12'/>
  <circle cx='100' cy='80' r='3' fill='#6c757d'/>
  <circle cx='100' cy='100' r='3' fill='#6c757d'/>
  <circle cx='100' cy='120' r='3' fill='#6c757d'/>
</svg>";

        var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(svg));
        return $"data:image/svg+xml;base64,{base64}";
    }

    private string GetPaginationPlaceholderSvg()
    {
        var svg = @"
<svg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#f8f9fa'/>
      <stop offset='50%' stop-color='#e9ecef'/>
      <stop offset='100%' stop-color='#dee2e6'/>
    </linearGradient>
  </defs>
  <rect width='200' height='200' fill='url(#bg)' rx='12'/>
  <path d='M80,100 L120,100 M110,90 L120,100 L110,110' stroke='#6c757d' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
</svg>";

        var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(svg));
        return $"data:image/svg+xml;base64,{base64}";
    }

    private string GetLoadMorePlaceholderSvg()
    {
        var svg = @"
<svg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#f8f9fa'/>
      <stop offset='50%' stop-color='#e9ecef'/>
      <stop offset='100%' stop-color='#dee2e6'/>
    </linearGradient>
  </defs>
  <rect width='200' height='200' fill='url(#bg)' rx='12'/>
  <path d='M100,80 L100,120 M90,110 L100,120 L110,110' stroke='#6c757d' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
</svg>";

        var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(svg));
        return $"data:image/svg+xml;base64,{base64}";
    }

    private string GetDefaultPlaceholderSvg()
    {
        var svg = @"
<svg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#f8f9fa'/>
      <stop offset='50%' stop-color='#e9ecef'/>
      <stop offset='100%' stop-color='#dee2e6'/>
    </linearGradient>
  </defs>
  <rect width='200' height='200' fill='url(#bg)' rx='12'/>
  <rect x='90' y='90' width='20' height='20' fill='#6c757d' rx='2'/>
</svg>";

        var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(svg));
        return $"data:image/svg+xml;base64,{base64}";
    }
}