namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Defines how uploaded images should be handled in the gallery
/// </summary>
public enum PhotoSwipeUploadMode
{
    /// <summary>
    /// Add uploaded images to the existing gallery items
    /// </summary>
    Add,
    
    /// <summary>
    /// Replace all existing gallery items with uploaded images
    /// </summary>
    Replace
}