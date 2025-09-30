using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using PhotoSwipe.Blazor.Models;

namespace PhotoSwipe.Blazor.Services;

/// <summary>
/// Service for processing uploaded files (images and documents) and creating PhotoSwipe items
/// </summary>
public class ImageProcessingService
{
    private readonly IJSRuntime _jsRuntime;
    private readonly FileTypeService _fileTypeService;
    private readonly string[] _supportedImageTypes = { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
    private readonly string[] _supportedDocumentTypes =
    {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/csv",
        "text/plain",
        "application/zip"
    };

    public ImageProcessingService(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
        _fileTypeService = new FileTypeService();
    }

    /// <summary>
    /// Gets the file accept string for HTML file input (images only)
    /// </summary>
    public static string GetFileAcceptString() => "image/jpeg,image/jpg,image/png,image/gif,image/webp";

    /// <summary>
    /// Gets the file accept string for HTML file input (all supported types)
    /// </summary>
    public static string GetAllFilesAcceptString() =>
        "image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/csv,text/plain,application/zip";

    /// <summary>
    /// Gets supported image file types as a readable string
    /// </summary>
    public static string[] GetSupportedTypes() => ["JPEG", "PNG", "GIF", "WebP"];

    /// <summary>
    /// Gets all supported file types as a readable string
    /// </summary>
    public static string[] GetAllSupportedTypes() => ["JPEG", "PNG", "GIF", "WebP", "PDF", "Word", "Excel", "PowerPoint", "CSV", "Text", "ZIP"];

    /// <summary>
    /// Validates if the file type is a supported image
    /// </summary>
    public bool IsValidFileType(IBrowserFile file)
    {
        return _supportedImageTypes.Contains(file.ContentType.ToLower());
    }

    /// <summary>
    /// Validates if the file type is supported (image or document)
    /// </summary>
    public bool IsValidFileTypeAny(IBrowserFile file)
    {
        var contentType = file.ContentType.ToLower();
        return _supportedImageTypes.Contains(contentType) || _supportedDocumentTypes.Contains(contentType);
    }

    /// <summary>
    /// Validates if the file size is within limits
    /// </summary>
    public bool IsValidFileSize(IBrowserFile file, long maxSizeBytes)
    {
        return file.Size <= maxSizeBytes;
    }

    /// <summary>
    /// Processes an uploaded image file and creates a PhotoSwipeItem
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
                Title = file.Name,
                IsImage = true,
                FileExtension = Path.GetExtension(file.Name),
                OriginalFileName = file.Name,
                FileSizeBytes = file.Size
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to process image file {file.Name}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Processes any supported file (image or document) and creates a PhotoSwipeItem
    /// </summary>
    public async Task<PhotoSwipeItem> ProcessFileAsync(IBrowserFile file, long maxSizeBytes = 10 * 1024 * 1024)
    {
        if (!IsValidFileTypeAny(file))
        {
            throw new ArgumentException($"File type {file.ContentType} is not supported. Supported types: {string.Join(", ", GetAllSupportedTypes())}");
        }

        if (!IsValidFileSize(file, maxSizeBytes))
        {
            throw new ArgumentException($"File size {FormatFileSize(file.Size)} exceeds maximum allowed size {FormatFileSize(maxSizeBytes)}");
        }

        // Check if it's an image
        var isImage = _fileTypeService.IsImageFile(file.Name);

        if (isImage)
        {
            // Process as image
            return await ProcessImageFileAsync(file, maxSizeBytes);
        }
        else
        {
            // Process as document
            return await ProcessDocumentFileAsync(file, maxSizeBytes);
        }
    }

    /// <summary>
    /// Processes a document file and creates a PhotoSwipeItem with file type icon
    /// </summary>
    private async Task<PhotoSwipeItem> ProcessDocumentFileAsync(IBrowserFile file, long maxSizeBytes)
    {
        try
        {
            var fileType = _fileTypeService.GetFileType(file.Name);
            var fileExtension = Path.GetExtension(file.Name);
            var iconDataUrl = _fileTypeService.GetFileIconDataUrl(file.Name);

            // For documents, we create a placeholder icon as the thumbnail
            // The actual file content is not displayed in the lightbox
            return new PhotoSwipeItem
            {
                Src = iconDataUrl,
                ThumbnailUrl = iconDataUrl,
                Width = 80,
                Height = 80,
                Alt = file.Name,
                Caption = $"{_fileTypeService.GetFileTypeDisplayName(fileType)} - {file.Name}",
                Title = file.Name,
                IsImage = false,
                FileExtension = fileExtension,
                FileType = fileType.ToString(),
                OriginalFileName = file.Name,
                FileSizeBytes = file.Size
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to process document file {file.Name}: {ex.Message}", ex);
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
        Action<int, int>? progressCallback = null,
        bool allowDocuments = false)
    {
        var result = new ProcessingResult();

        for (int i = 0; i < files.Count; i++)
        {
            var file = files[i];
            progressCallback?.Invoke(i + 1, files.Count);

            try
            {
                var photoSwipeItem = allowDocuments
                    ? await ProcessFileAsync(file, maxSizeBytes)
                    : await ProcessImageFileAsync(file, maxSizeBytes);
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