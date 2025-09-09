using System.Text.Json.Serialization;

namespace PhotoSwipe.Blazor.Models;

public class PhotoSwipeOptions
{
    [JsonPropertyName("gallery")]
    public string? Gallery { get; set; }

    [JsonPropertyName("children")]
    public string? Children { get; set; }

    [JsonPropertyName("showHideAnimationType")]
    public string? ShowHideAnimationType { get; set; } = "fade";

    [JsonPropertyName("showAnimationDuration")]
    public int? ShowAnimationDuration { get; set; } = 333;

    [JsonPropertyName("hideAnimationDuration")]
    public int? HideAnimationDuration { get; set; } = 333;

    [JsonPropertyName("bgOpacity")]
    public double? BackgroundOpacity { get; set; } = 0.8;

    [JsonPropertyName("spacing")]
    public double? Spacing { get; set; } = 0.1;

    [JsonPropertyName("allowPanToNext")]
    public bool? AllowPanToNext { get; set; } = true;

    [JsonPropertyName("loop")]
    public bool? Loop { get; set; } = true;

    [JsonPropertyName("pinchToClose")]
    public bool? PinchToClose { get; set; } = true;

    [JsonPropertyName("closeOnVerticalDrag")]
    public bool? CloseOnVerticalDrag { get; set; } = true;

    [JsonPropertyName("mouseMovePan")]
    public bool? MouseMovePan { get; set; } = true;

    [JsonPropertyName("escKey")]
    public bool? EscKey { get; set; } = true;

    [JsonPropertyName("arrowKeys")]
    public bool? ArrowKeys { get; set; } = true;

    [JsonPropertyName("returnFocus")]
    public bool? ReturnFocus { get; set; } = true;

    [JsonPropertyName("clickToCloseNonZoomable")]
    public bool? ClickToCloseNonZoomable { get; set; } = true;

    [JsonPropertyName("trapFocus")]
    public bool? TrapFocus { get; set; } = true;

    [JsonPropertyName("preload")]
    public int[]? Preload { get; set; } = new[] { 1, 3 };

    [JsonPropertyName("closeTitle")]
    public string? CloseTitle { get; set; } = "Close (Esc)";

    [JsonPropertyName("zoomTitle")]
    public string? ZoomTitle { get; set; } = "Zoom";

    [JsonPropertyName("arrowPrevTitle")]
    public string? ArrowPrevTitle { get; set; } = "Previous (arrow left)";

    [JsonPropertyName("arrowNextTitle")]
    public string? ArrowNextTitle { get; set; } = "Next (arrow right)";

    [JsonPropertyName("errorMsg")]
    public string? ErrorMessage { get; set; } = "The image cannot be loaded";

    [JsonPropertyName("wheelToZoom")]
    public bool? WheelToZoom { get; set; } = false;

    [JsonPropertyName("zoom")]
    public bool? Zoom { get; set; } = true;

    [JsonPropertyName("counter")]
    public bool? Counter { get; set; } = true;

    [JsonPropertyName("maxZoomLevel")]
    public double? MaxZoomLevel { get; set; } = 2;

    [JsonPropertyName("initialZoomLevel")]
    public string? InitialZoomLevel { get; set; } = "fit";

    [JsonPropertyName("secondaryZoomLevel")]
    public string? SecondaryZoomLevel { get; set; } = "2.5";

    [JsonPropertyName("mainClass")]
    public string? MainClass { get; set; }

    [JsonPropertyName("appendToEl")]
    public string? AppendToEl { get; set; }

    [JsonPropertyName("getNumItemsFn")]
    public string? GetNumItemsFn { get; set; }

    [JsonPropertyName("index")]
    public int? Index { get; set; } = 0;

    [JsonPropertyName("preloadFirstSlide")]
    public bool? PreloadFirstSlide { get; set; } = true;

    [JsonPropertyName("tapAction")]
    public string? TapAction { get; set; } = "toggle-controls";

    [JsonPropertyName("doubleTapAction")]
    public string? DoubleTapAction { get; set; } = "zoom";

    [JsonPropertyName("imageClickAction")]
    public string? ImageClickAction { get; set; } = "zoom-or-close";

    [JsonPropertyName("paddingFn")]
    public string? PaddingFn { get; set; }
}