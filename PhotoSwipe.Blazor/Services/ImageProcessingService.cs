using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using PhotoSwipe.Blazor.Models;

namespace PhotoSwipe.Blazor.Services;

/// <summary>
/// Service for processing uploaded image files and creating PhotoSwipe items
/// </summary>
public class ImageProcessingService
{
    private readonly IJSRuntime _jsRuntime;
    private readonly string[] _supportedTypes = { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };

    public ImageProcessingService(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
    }

    /// <summary>
    /// Gets the file accept string for HTML file input
    /// </summary>
    public static string GetFileAcceptString() => "image/jpeg,image/jpg,image/png,image/gif,image/webp";

    /// <summary>
    /// Gets supported file types as a readable string
    /// </summary>
    public static string[] GetSupportedTypes() => ["JPEG", "PNG", "GIF", "WebP"];

    /// <summary>
    /// Validates if the file type is supported
    /// </summary>
    public bool IsValidFileType(IBrowserFile file)
    {
        return _supportedTypes.Contains(file.ContentType.ToLower());
    }

    /// <summary>
    /// Validates if the file size is within limits
    /// </summary>
    public bool IsValidFileSize(IBrowserFile file, long maxSizeBytes)
    {
        return file.Size <= maxSizeBytes;
    }

    /// <summary>
    /// Processes an uploaded file and creates a PhotoSwipeItem
    /// </summary>
    public async Task<PhotoSwipeItem> ProcessImageFileAsync(IBrowserFile file, long maxSizeBytes = 10 * 1024 * 1024)
    {
        if (!IsValidFileType(file))
        {
            throw new ArgumentException($"File type {file.ContentType} is not supported. Supported types: {string.Join(", ", GetSupportedTypes())}");
        }

        if (!IsValidFileSize(file, maxSizeBytes))
        {
            throw new ArgumentException($"File size {FormatFileSize(file.Size)} exceeds maximum allowed size {FormatFileSize(maxSizeBytes)}");
        }

        try
        {
            // Create data URL for the image
            var buffer = new byte[file.Size];
            using var stream = file.OpenReadStream(maxSizeBytes);
            await stream.ReadExactlyAsync(buffer);

            var base64String = Convert.ToBase64String(buffer);
            var dataUrl = $"data:{file.ContentType};base64,{base64String}";

            // Try to get image dimensions using JavaScript
            var dimensions = await GetImageDimensionsAsync(dataUrl);

            return new PhotoSwipeItem
            {
                Src = dataUrl,
                ThumbnailUrl = dataUrl,
                Width = dimensions.Width,
                Height = dimensions.Height,
                Alt = file.Name,
                Caption = file.Name,
                Title = file.Name
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to process image file {file.Name}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Gets image dimensions using JavaScript
    /// </summary>
    private async Task<(int Width, int Height)> GetImageDimensionsAsync(string imageUrl)
    {
        try
        {
            var result = await _jsRuntime.InvokeAsync<int[]>("eval", $@"
                new Promise((resolve) => {{
                    const img = new Image();
                    img.onload = () => resolve([img.width, img.height]);
                    img.onerror = () => resolve([800, 600]); // Default dimensions on error
                    img.src = '{imageUrl}';
                }})
            ");

            return result.Length >= 2 ? (result[0], result[1]) : (800, 600);
        }
        catch
        {
            // Return default dimensions if JS fails
            return (800, 600);
        }
    }

    /// <summary>
    /// Formats file size in human readable format
    /// </summary>
    public static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.#} {sizes[order]}";
    }

    /// <summary>
    /// Processes multiple files and returns results with error information
    /// </summary>
    public async Task<ProcessingResult> ProcessMultipleFilesAsync(
        IReadOnlyList<IBrowserFile> files, 
        long maxSizeBytes = 10 * 1024 * 1024,
        Action<int, int>? progressCallback = null)
    {
        var result = new ProcessingResult();
        
        for (int i = 0; i < files.Count; i++)
        {
            var file = files[i];
            progressCallback?.Invoke(i + 1, files.Count);

            try
            {
                var photoSwipeItem = await ProcessImageFileAsync(file, maxSizeBytes);
                result.SuccessfulItems.Add(photoSwipeItem);
            }
            catch (Exception ex)
            {
                result.Errors.Add($"{file.Name}: {ex.Message}");
            }
        }

        return result;
    }
}

/// <summary>
/// Result of processing multiple files
/// </summary>
public class ProcessingResult
{
    public List<PhotoSwipeItem> SuccessfulItems { get; } = [];
    public List<string> Errors { get; } = [];
    
    public bool HasErrors => Errors.Count > 0;
    public bool HasSuccessfulItems => SuccessfulItems.Count > 0;
    public int TotalProcessed => SuccessfulItems.Count + Errors.Count;
}