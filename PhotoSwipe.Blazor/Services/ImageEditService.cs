using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using Microsoft.Extensions.Logging;
using PhotoSwipe.Blazor.Models;

namespace PhotoSwipe.Blazor.Services;

/// <summary>
/// Service for handling image edit operations with file validation and processing.
/// Provides reusable edit functionality that can be shared between components.
/// </summary>
public class ImageEditService
{
    private readonly IJSRuntime _jsRuntime;
    private readonly ILogger _logger;
    private readonly ImageProcessingService _imageProcessingService;

    public ImageEditService(IJSRuntime jsRuntime, ILogger logger)
    {
        _jsRuntime = jsRuntime;
        _logger = logger;
        _imageProcessingService = new ImageProcessingService(jsRuntime);
    }

    /// <summary>
    /// Triggers the browser's file picker dialog programmatically.
    /// Used to provide a seamless edit experience without modal dialogs.
    /// </summary>
    /// <param name="fileInputId">The ID of the hidden file input element</param>
    public async Task TriggerFilePickerAsync(string fileInputId)
    {
        try
        {
            // Small delay to ensure DOM is updated
            await Task.Delay(50);

            // Trigger file input click using JavaScript
            await _jsRuntime.InvokeVoidAsync("eval", $"document.getElementById('{fileInputId}')?.click()");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to trigger file picker for input: {InputId}", fileInputId);
        }
    }

    /// <summary>
    /// Processes a file selection for editing an existing image.
    /// Validates the file and converts it to a PhotoSwipeItem.
    /// </summary>
    /// <param name="file">The selected file from InputFileChangeEventArgs</param>
    /// <param name="maxFileSize">Maximum allowed file size in bytes</param>
    /// <returns>The processed PhotoSwipeItem or throws an exception on error</returns>
    public async Task<PhotoSwipeItem> ProcessEditFileAsync(IBrowserFile file, long maxFileSize)
    {
        // Validate file type
        if (!_imageProcessingService.IsValidFileType(file))
        {
            var error = $"Invalid file type. Please select a valid image file.";
            _logger.LogWarning("Invalid file type for edit: {FileName}", file.Name);
            throw new InvalidOperationException(error);
        }

        // Validate file size
        if (!_imageProcessingService.IsValidFileSize(file, maxFileSize))
        {
            var maxSizeMB = maxFileSize / (1024.0 * 1024.0);
            var error = $"File size ({file.Size / (1024.0 * 1024.0):F1}MB) exceeds maximum allowed size ({maxSizeMB:F1}MB).";
            _logger.LogWarning("File too large for edit: {Size} > {MaxSize}", file.Size, maxFileSize);
            throw new InvalidOperationException(error);
        }

        // Process the image
        try
        {
            var newItem = await _imageProcessingService.ProcessImageFileAsync(file, maxFileSize);
            _logger.LogInformation("Successfully processed edit file: {FileName}", file.Name);
            return newItem;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing edit file: {FileName}", file.Name);
            throw;
        }
    }

    /// <summary>
    /// Gets the SVG icon markup for edit buttons.
    /// Provides consistent edit icon across components.
    /// </summary>
    /// <returns>SVG markup string for edit icon</returns>
    public string GetEditIconSvg()
    {
        return @"<svg width=""16"" height=""16"" viewBox=""0 0 24 24"" fill=""none"" xmlns=""http://www.w3.org/2000/svg"">
                   <path d=""M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7""
                         stroke=""currentColor"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round""/>
                   <path d=""m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z""
                         stroke=""currentColor"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round""/>
                 </svg>";
    }
}