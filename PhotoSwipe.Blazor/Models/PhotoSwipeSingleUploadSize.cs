namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Defines the size variants for PhotoSwipeSingleUpload component
/// </summary>
public enum PhotoSwipeSingleUploadSize
{
    /// <summary>
    /// Default size (300px max-width, 150px min-height, 24px padding)
    /// </summary>
    Default,

    /// <summary>
    /// Small size (150px max-width, 100px min-height, 16px padding)
    /// </summary>
    Small,

    /// <summary>
    /// Large size (500px max-width, 200px min-height, 32px padding)
    /// </summary>
    Large
}