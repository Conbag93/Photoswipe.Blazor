namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Defines the shape variants for PhotoSwipeSingleUpload component
/// </summary>
public enum PhotoSwipeSingleUploadShape
{
    /// <summary>
    /// Rectangular shape with rounded corners (8px border-radius)
    /// </summary>
    Rectangle,

    /// <summary>
    /// Circular shape with 50% border-radius - works best with Square aspect ratio
    /// </summary>
    Circle
}