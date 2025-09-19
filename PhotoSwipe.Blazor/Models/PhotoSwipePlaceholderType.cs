namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Defines the types of placeholders that can be displayed in a PhotoSwipe gallery.
/// Placeholders are UI-only elements that provide interactive functionality
/// without being part of the actual gallery data.
/// </summary>
public enum PhotoSwipePlaceholderType
{
    /// <summary>
    /// Upload placeholder - allows adding new items to the gallery
    /// </summary>
    Upload,

    /// <summary>
    /// See more placeholder - expands or navigates to additional content
    /// </summary>
    SeeMore,

    /// <summary>
    /// Pagination placeholder - for loading additional pages of content
    /// </summary>
    Pagination,

    /// <summary>
    /// Load more placeholder - for infinite scroll or manual load more functionality
    /// </summary>
    LoadMore
}