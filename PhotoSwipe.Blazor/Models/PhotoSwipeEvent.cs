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