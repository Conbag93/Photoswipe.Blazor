namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Defines the aspect ratio variants for PhotoSwipeSingleUpload component
/// </summary>
public enum PhotoSwipeSingleUploadAspectRatio
{
    /// <summary>
    /// Auto aspect ratio based on image dimensions or container settings
    /// </summary>
    Auto,

    /// <summary>
    /// Square 1:1 aspect ratio - forces both upload area and display to be square
    /// </summary>
    Square
}