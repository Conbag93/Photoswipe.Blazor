namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Defines the position of the upload area relative to the gallery
/// </summary>
public enum PhotoSwipeUploadPosition
{
    /// <summary>
    /// Upload area appears above the gallery
    /// </summary>
    Above,

    /// <summary>
    /// Upload area appears below the gallery
    /// </summary>
    Below,

    /// <summary>
    /// Upload area is contained within the gallery (future implementation)
    /// </summary>
    Contained
}