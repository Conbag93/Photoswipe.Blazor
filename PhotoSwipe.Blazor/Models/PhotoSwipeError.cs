namespace PhotoSwipe.Blazor.Models;

/// <summary>
/// Represents an error that occurred during file upload or processing
/// </summary>
public class PhotoSwipeFileError
{
    /// <summary>
    /// Name of the file that failed to process
    /// </summary>
    public required string FileName { get; init; }

    /// <summary>
    /// Size of the file in bytes
    /// </summary>
    public long FileSize { get; init; }

    /// <summary>
    /// MIME content type of the file
    /// </summary>
    public required string ContentType { get; init; }

    /// <summary>
    /// Category of error that occurred
    /// </summary>
    public PhotoSwipeErrorType ErrorType { get; init; }

    /// <summary>
    /// User-friendly error message
    /// </summary>
    public required string Message { get; init; }

    /// <summary>
    /// Type of exception that caused the error (if applicable)
    /// </summary>
    public string? ExceptionType { get; init; }

    /// <summary>
    /// Stack trace for debugging (if applicable)
    /// </summary>
    public string? StackTrace { get; init; }

    /// <summary>
    /// Additional context data for the error
    /// </summary>
    public Dictionary<string, object> AdditionalData { get; init; } = new();

    /// <summary>
    /// When the error occurred
    /// </summary>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Indicates if this error is likely related to cloud storage (OneDrive, Google Drive, etc.)
    /// </summary>
    public bool IsCloudStorageIssue => ErrorType == PhotoSwipeErrorType.StreamReadFailure &&
                                       (ExceptionType?.Contains("Stream") == true ||
                                        Message.Contains("cloud", StringComparison.OrdinalIgnoreCase) ||
                                        Message.Contains("OneDrive", StringComparison.OrdinalIgnoreCase) ||
                                        Message.Contains("Google Drive", StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Suggested action for the user to resolve the error
    /// </summary>
    public string SuggestedAction => ErrorType switch
    {
        PhotoSwipeErrorType.InvalidFileType => "Please select a supported file type.",
        PhotoSwipeErrorType.FileSizeTooLarge => "Please reduce the file size or select a smaller file.",
        PhotoSwipeErrorType.StreamReadFailure when IsCloudStorageIssue =>
            "This file appears to be in cloud storage. Please download it locally first, then upload.",
        PhotoSwipeErrorType.StreamReadFailure => "Please try uploading the file again. If the problem persists, try saving a local copy first.",
        PhotoSwipeErrorType.ProcessingFailure => "Please try uploading a different version of this file.",
        PhotoSwipeErrorType.DimensionDetectionFailure => "The file will be uploaded with default dimensions.",
        _ => "Please try again or contact support if the issue persists."
    };

    /// <summary>
    /// Creates a file error from an exception
    /// </summary>
    public static PhotoSwipeFileError FromException(
        string fileName,
        long fileSize,
        string contentType,
        Exception exception,
        PhotoSwipeErrorType errorType = PhotoSwipeErrorType.Unknown)
    {
        return new PhotoSwipeFileError
        {
            FileName = fileName,
            FileSize = fileSize,
            ContentType = contentType,
            ErrorType = errorType,
            Message = exception.Message,
            ExceptionType = exception.GetType().Name,
            StackTrace = exception.StackTrace,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Creates a file error with a custom message
    /// </summary>
    public static PhotoSwipeFileError Create(
        string fileName,
        long fileSize,
        string contentType,
        PhotoSwipeErrorType errorType,
        string message,
        Dictionary<string, object>? additionalData = null)
    {
        return new PhotoSwipeFileError
        {
            FileName = fileName,
            FileSize = fileSize,
            ContentType = contentType,
            ErrorType = errorType,
            Message = message,
            AdditionalData = additionalData ?? new Dictionary<string, object>(),
            Timestamp = DateTime.UtcNow
        };
    }
}

/// <summary>
/// Categories of errors that can occur during file upload/processing
/// </summary>
public enum PhotoSwipeErrorType
{
    /// <summary>
    /// File type is not supported
    /// </summary>
    InvalidFileType,

    /// <summary>
    /// File size exceeds maximum allowed
    /// </summary>
    FileSizeTooLarge,

    /// <summary>
    /// Failed to read file stream (often indicates cloud storage or permission issues)
    /// </summary>
    StreamReadFailure,

    /// <summary>
    /// General processing failure during file conversion
    /// </summary>
    ProcessingFailure,

    /// <summary>
    /// Failed to detect image dimensions (non-fatal)
    /// </summary>
    DimensionDetectionFailure,

    /// <summary>
    /// Unknown or unclassified error
    /// </summary>
    Unknown
}

/// <summary>
/// Result of uploading and processing multiple files
/// </summary>
public class PhotoSwipeUploadResult
{
    /// <summary>
    /// Files that were successfully processed
    /// </summary>
    public IReadOnlyList<PhotoSwipeItem> SuccessfulItems { get; init; } = Array.Empty<PhotoSwipeItem>();

    /// <summary>
    /// Errors that occurred during processing
    /// </summary>
    public IReadOnlyList<PhotoSwipeFileError> Errors { get; init; } = Array.Empty<PhotoSwipeFileError>();

    /// <summary>
    /// Total number of files processed (successful + failed)
    /// </summary>
    public int TotalProcessed => SuccessfulItems.Count + Errors.Count;

    /// <summary>
    /// Whether any errors occurred
    /// </summary>
    public bool HasErrors => Errors.Count > 0;

    /// <summary>
    /// Whether any files were successfully processed
    /// </summary>
    public bool HasSuccessfulItems => SuccessfulItems.Count > 0;

    /// <summary>
    /// Success rate as a percentage (0-100)
    /// </summary>
    public double SuccessRate => TotalProcessed == 0 ? 0 : (double)SuccessfulItems.Count / TotalProcessed * 100;

    /// <summary>
    /// Creates an empty result
    /// </summary>
    public static PhotoSwipeUploadResult Empty => new();

    /// <summary>
    /// Creates a result with only successful items
    /// </summary>
    public static PhotoSwipeUploadResult Success(IEnumerable<PhotoSwipeItem> items)
    {
        return new PhotoSwipeUploadResult
        {
            SuccessfulItems = items.ToList(),
            Errors = Array.Empty<PhotoSwipeFileError>()
        };
    }

    /// <summary>
    /// Creates a result with only errors
    /// </summary>
    public static PhotoSwipeUploadResult Failure(IEnumerable<PhotoSwipeFileError> errors)
    {
        return new PhotoSwipeUploadResult
        {
            SuccessfulItems = Array.Empty<PhotoSwipeItem>(),
            Errors = errors.ToList()
        };
    }

    /// <summary>
    /// Creates a result with both successful items and errors
    /// </summary>
    public static PhotoSwipeUploadResult Create(
        IEnumerable<PhotoSwipeItem> successfulItems,
        IEnumerable<PhotoSwipeFileError> errors)
    {
        return new PhotoSwipeUploadResult
        {
            SuccessfulItems = successfulItems.ToList(),
            Errors = errors.ToList()
        };
    }
}
