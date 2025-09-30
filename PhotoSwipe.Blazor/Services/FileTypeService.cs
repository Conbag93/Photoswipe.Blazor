namespace PhotoSwipe.Blazor.Services;

/// <summary>
/// Service for detecting file types and providing appropriate icons for display
/// </summary>
public class FileTypeService
{
    /// <summary>
    /// File type categories for icon mapping
    /// </summary>
    public enum FileTypeCategory
    {
        Image,
        Pdf,
        Word,
        Excel,
        PowerPoint,
        Csv,
        Text,
        Archive,
        Unknown
    }

    private static readonly Dictionary<string, FileTypeCategory> _extensionMap = new(StringComparer.OrdinalIgnoreCase)
    {
        // Images
        { ".jpg", FileTypeCategory.Image },
        { ".jpeg", FileTypeCategory.Image },
        { ".png", FileTypeCategory.Image },
        { ".gif", FileTypeCategory.Image },
        { ".webp", FileTypeCategory.Image },
        { ".bmp", FileTypeCategory.Image },
        { ".svg", FileTypeCategory.Image },
        { ".ico", FileTypeCategory.Image },

        // PDF
        { ".pdf", FileTypeCategory.Pdf },

        // Word
        { ".doc", FileTypeCategory.Word },
        { ".docx", FileTypeCategory.Word },
        { ".odt", FileTypeCategory.Word },
        { ".rtf", FileTypeCategory.Word },

        // Excel
        { ".xls", FileTypeCategory.Excel },
        { ".xlsx", FileTypeCategory.Excel },
        { ".ods", FileTypeCategory.Excel },

        // PowerPoint
        { ".ppt", FileTypeCategory.PowerPoint },
        { ".pptx", FileTypeCategory.PowerPoint },
        { ".odp", FileTypeCategory.PowerPoint },

        // CSV
        { ".csv", FileTypeCategory.Csv },

        // Text
        { ".txt", FileTypeCategory.Text },
        { ".md", FileTypeCategory.Text },
        { ".json", FileTypeCategory.Text },
        { ".xml", FileTypeCategory.Text },
        { ".log", FileTypeCategory.Text },

        // Archive
        { ".zip", FileTypeCategory.Archive },
        { ".rar", FileTypeCategory.Archive },
        { ".7z", FileTypeCategory.Archive },
        { ".tar", FileTypeCategory.Archive },
        { ".gz", FileTypeCategory.Archive }
    };

    private static readonly Dictionary<string, string> _mimeTypeMap = new(StringComparer.OrdinalIgnoreCase)
    {
        // Images
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" },
        { ".gif", "image/gif" },
        { ".webp", "image/webp" },
        { ".bmp", "image/bmp" },
        { ".svg", "image/svg+xml" },

        // PDF
        { ".pdf", "application/pdf" },

        // Word
        { ".doc", "application/msword" },
        { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { ".odt", "application/vnd.oasis.opendocument.text" },
        { ".rtf", "application/rtf" },

        // Excel
        { ".xls", "application/vnd.ms-excel" },
        { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        { ".ods", "application/vnd.oasis.opendocument.spreadsheet" },

        // PowerPoint
        { ".ppt", "application/vnd.ms-powerpoint" },
        { ".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
        { ".odp", "application/vnd.oasis.opendocument.presentation" },

        // CSV
        { ".csv", "text/csv" },

        // Text
        { ".txt", "text/plain" },
        { ".md", "text/markdown" },
        { ".json", "application/json" },
        { ".xml", "application/xml" },
        { ".log", "text/plain" },

        // Archive
        { ".zip", "application/zip" },
        { ".rar", "application/x-rar-compressed" },
        { ".7z", "application/x-7z-compressed" },
        { ".tar", "application/x-tar" },
        { ".gz", "application/gzip" }
    };

    /// <summary>
    /// Gets the file type category based on file extension
    /// </summary>
    public FileTypeCategory GetFileType(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        return _extensionMap.GetValueOrDefault(extension, FileTypeCategory.Unknown);
    }

    /// <summary>
    /// Checks if the file is an image
    /// </summary>
    public bool IsImageFile(string fileName)
    {
        return GetFileType(fileName) == FileTypeCategory.Image;
    }

    /// <summary>
    /// Gets the MIME type for a file extension
    /// </summary>
    public string GetMimeType(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        return _mimeTypeMap.GetValueOrDefault(extension, "application/octet-stream");
    }

    /// <summary>
    /// Gets a data URL containing the appropriate icon SVG for the file type
    /// </summary>
    public string GetFileIconDataUrl(string fileName)
    {
        var fileType = GetFileType(fileName);
        var svg = GetFileIconSvg(fileType);
        var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(svg));
        return $"data:image/svg+xml;base64,{base64}";
    }

    /// <summary>
    /// Gets the SVG icon for a file type category
    /// </summary>
    public string GetFileIconSvg(FileTypeCategory fileType)
    {
        return fileType switch
        {
            FileTypeCategory.Pdf => GetPdfIconSvg(),
            FileTypeCategory.Word => GetWordIconSvg(),
            FileTypeCategory.Excel => GetExcelIconSvg(),
            FileTypeCategory.PowerPoint => GetPowerPointIconSvg(),
            FileTypeCategory.Csv => GetCsvIconSvg(),
            FileTypeCategory.Text => GetTextIconSvg(),
            FileTypeCategory.Archive => GetArchiveIconSvg(),
            _ => GetGenericFileIconSvg()
        };
    }

    /// <summary>
    /// Gets a friendly display name for the file type
    /// </summary>
    public string GetFileTypeDisplayName(FileTypeCategory fileType)
    {
        return fileType switch
        {
            FileTypeCategory.Image => "Image",
            FileTypeCategory.Pdf => "PDF Document",
            FileTypeCategory.Word => "Word Document",
            FileTypeCategory.Excel => "Excel Spreadsheet",
            FileTypeCategory.PowerPoint => "PowerPoint Presentation",
            FileTypeCategory.Csv => "CSV File",
            FileTypeCategory.Text => "Text File",
            FileTypeCategory.Archive => "Archive",
            _ => "File"
        };
    }

    #region SVG Icons

    private static string GetPdfIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 640 640""><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d=""M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L208 576L208 464C208 428.7 236.7 400 272 400L448 400L448 234.5C448 217.5 441.3 201.2 429.3 189.2L322.7 82.7C310.7 70.7 294.5 64 277.5 64L128 64zM389.5 240L296 240C282.7 240 272 229.3 272 216L272 122.5L389.5 240zM272 444C261 444 252 453 252 464L252 592C252 603 261 612 272 612C283 612 292 603 292 592L292 564L304 564C337.1 564 364 537.1 364 504C364 470.9 337.1 444 304 444L272 444zM304 524L292 524L292 484L304 484C315 484 324 493 324 504C324 515 315 524 304 524zM400 444C389 444 380 453 380 464L380 592C380 603 389 612 400 612L432 612C460.7 612 484 588.7 484 560L484 496C484 467.3 460.7 444 432 444L400 444zM420 572L420 484L432 484C438.6 484 444 489.4 444 496L444 560C444 566.6 438.6 572 432 572L420 572zM508 464L508 592C508 603 517 612 528 612C539 612 548 603 548 592L548 548L576 548C587 548 596 539 596 528C596 517 587 508 576 508L548 508L548 484L576 484C587 484 596 475 596 464C596 453 587 444 576 444L528 444C517 444 508 453 508 464z""/></svg>";
    }

    private static string GetWordIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 640 640""><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d=""M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM263.4 338.8C260.5 325.9 247.7 317.7 234.8 320.6C221.9 323.5 213.7 336.3 216.6 349.2L248.6 493.2C250.9 503.7 260 511.4 270.8 512C281.6 512.6 291.4 505.9 294.8 495.6L320 419.9L345.2 495.6C348.6 505.8 358.4 512.5 369.2 512C380 511.5 389.1 503.8 391.4 493.2L423.4 349.2C426.3 336.3 418.1 323.4 405.2 320.6C392.3 317.8 379.4 325.9 376.6 338.8L363.4 398.2L342.8 336.4C339.5 326.6 330.4 320 320 320C309.6 320 300.5 326.6 297.2 336.4L276.6 398.2L263.4 338.8z""/></svg>";
    }

    private static string GetExcelIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 640 640""><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d=""M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM292 330.7C284.6 319.7 269.7 316.7 258.7 324C247.7 331.3 244.7 346.3 252 357.3L291.2 416L252 474.7C244.6 485.7 247.6 500.6 258.7 508C269.8 515.4 284.6 512.4 292 501.3L320 459.3L348 501.3C355.4 512.3 370.3 515.3 381.3 508C392.3 500.7 395.3 485.7 388 474.7L348.8 416L388 357.3C395.4 346.3 392.4 331.4 381.3 324C370.2 316.6 355.4 319.6 348 330.7L320 372.7L292 330.7z""/></svg>";
    }

    private static string GetPowerPointIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 640 640""><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d=""M128 128C128 92.7 156.7 64 192 64L341.5 64C358.5 64 374.8 70.7 386.8 82.7L493.3 189.3C505.3 201.3 512 217.6 512 234.6L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 128zM336 122.5L336 216C336 229.3 346.7 240 360 240L453.5 240L336 122.5zM280 320C266.7 320 256 330.7 256 344L256 488C256 501.3 266.7 512 280 512C293.3 512 304 501.3 304 488L304 464L328 464C367.8 464 400 431.8 400 392C400 352.2 367.8 320 328 320L280 320zM328 416L304 416L304 368L328 368C341.3 368 352 378.7 352 392C352 405.3 341.3 416 328 416z""/></svg>";
    }

    private static string GetCsvIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 640 640""><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d=""M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L208 576L208 464C208 428.7 236.7 400 272 400L448 400L448 234.5C448 217.5 441.3 201.2 429.3 189.2L322.7 82.7C310.7 70.7 294.5 64 277.5 64L128 64zM389.5 240L296 240C282.7 240 272 229.3 272 216L272 122.5L389.5 240zM296 444C271.7 444 252 463.7 252 488L252 568C252 592.3 271.7 612 296 612L312 612C336.3 612 356 592.3 356 568L356 560C356 549 347 540 336 540C325 540 316 549 316 560L316 568C316 570.2 314.2 572 312 572L296 572C293.8 572 292 570.2 292 568L292 488C292 485.8 293.8 484 296 484L312 484C314.2 484 316 485.8 316 488L316 496C316 507 325 516 336 516C347 516 356 507 356 496L356 488C356 463.7 336.3 444 312 444L296 444zM432 444C403.3 444 380 467.3 380 496C380 524.7 403.3 548 432 548C438.6 548 444 553.4 444 560C444 566.6 438.6 572 432 572L400 572C389 572 380 581 380 592C380 603 389 612 400 612L432 612C460.7 612 484 588.7 484 560C484 531.3 460.7 508 432 508C425.4 508 420 502.6 420 496C420 489.4 425.4 484 432 484L456 484C467 484 476 475 476 464C476 453 467 444 456 444L432 444zM528 444C517 444 508 453 508 464L508 495.6C508 531.1 518.5 565.9 538.2 595.4L543.3 603.1C547 608.7 553.3 612 559.9 612C566.5 612 572.8 608.7 576.5 603.1L581.6 595.4C601.3 565.8 611.8 531.1 611.8 495.6L611.8 464C611.8 453 602.8 444 591.8 444C580.8 444 571.8 453 571.8 464L571.8 495.6C571.8 515.2 567.7 534.5 559.8 552.3C551.9 534.5 547.8 515.2 547.8 495.6L547.8 464C547.8 453 538.8 444 527.8 444z""/></svg>";
    }

    private static string GetTextIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 384 512"" width=""200"" height=""200"">
            <rect width=""384"" height=""512"" fill=""#7f8c8d"" rx=""20""/>
            <path d=""M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"" fill=""white""/>
            <text x=""192"" y=""450"" font-size=""70"" font-weight=""bold"" text-anchor=""middle"" fill=""white"">TXT</text>
        </svg>";
    }

    private static string GetArchiveIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 384 512"" width=""200"" height=""200"">
            <rect width=""384"" height=""512"" fill=""#f39c12"" rx=""20""/>
            <path d=""M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"" fill=""white""/>
            <rect x=""160"" y=""200"" width=""64"" height=""20"" fill=""white""/>
            <rect x=""160"" y=""240"" width=""64"" height=""20"" fill=""white""/>
            <rect x=""160"" y=""280"" width=""64"" height=""20"" fill=""white""/>
            <rect x=""160"" y=""320"" width=""64"" height=""20"" fill=""white""/>
            <text x=""192"" y=""450"" font-size=""70"" font-weight=""bold"" text-anchor=""middle"" fill=""white"">ZIP</text>
        </svg>";
    }

    private static string GetGenericFileIconSvg()
    {
        return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 384 512"" width=""200"" height=""200"">
            <rect width=""384"" height=""512"" fill=""#95a5a6"" rx=""20""/>
            <path d=""M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"" fill=""white""/>
            <circle cx=""192"" cy=""320"" r=""60"" fill=""white""/>
            <text x=""192"" y=""340"" font-size=""50"" font-weight=""bold"" text-anchor=""middle"" fill=""#95a5a6"">?</text>
        </svg>";
    }

    #endregion
}