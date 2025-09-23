namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Defines how the "Load More" functionality should be displayed in the gallery
/// </summary>
public enum LoadMoreMode
{
    /// <summary>
    /// Renders the load more button as a separate item in the gallery grid
    /// </summary>
    SeparateItem,

    /// <summary>
    /// Renders the load more button as an overlay on the last visible item
    /// </summary>
    OverlayOnLastItem
}