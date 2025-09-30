namespace PhotoSwipe.Blazor.Models;

public class PhotoSwipeEvent
{
    public string Type { get; set; } = string.Empty;
    public int Index { get; set; }
    public string? Id { get; set; }
}

public class PhotoSwipeEventArgs : EventArgs
{
    public PhotoSwipeEvent Event { get; }

    public PhotoSwipeEventArgs(PhotoSwipeEvent @event)
    {
        Event = @event;
    }
}

/// <summary>
/// Event arguments for item click events in PhotoSwipe galleries.
/// Allows custom handling of item clicks and prevention of default PhotoSwipe lightbox behavior.
/// </summary>
public class PhotoSwipeItemClickEventArgs : EventArgs
{
    /// <summary>
    /// The PhotoSwipeItem that was clicked
    /// </summary>
    public PhotoSwipeItem Item { get; }

    /// <summary>
    /// The index of the clicked item in the gallery
    /// </summary>
    public int Index { get; }

    /// <summary>
    /// Set to true to prevent the default PhotoSwipe lightbox from opening.
    /// Useful for implementing custom behaviors like downloading documents.
    /// </summary>
    public bool PreventDefault { get; set; }

    public PhotoSwipeItemClickEventArgs(PhotoSwipeItem item, int index)
    {
        Item = item;
        Index = index;
    }
}