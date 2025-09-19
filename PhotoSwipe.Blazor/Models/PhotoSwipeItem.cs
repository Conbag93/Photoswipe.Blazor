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
}