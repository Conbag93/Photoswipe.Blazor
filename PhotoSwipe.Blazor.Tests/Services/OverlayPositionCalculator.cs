using PhotoSwipe.Blazor.Components;

namespace PhotoSwipe.Blazor.Tests.Services;

/// <summary>
/// Service for calculating expected overlay control positions for testing purposes.
/// Replicates the logic from PhotoSwipeOverlayControl component to provide expected coordinates.
/// </summary>
public class OverlayPositionCalculator
{
    /// <summary>
    /// Represents the calculated position result
    /// </summary>
    public record PositionResult(
        double X,
        double Y,
        string CssTransform,
        string CssPositioning,
        bool IsConstrained);

    /// <summary>
    /// Represents container dimensions
    /// </summary>
    public record ContainerSize(double Width, double Height);

    private const int DefaultOffset = 12;
    private const int DefaultButtonSize = 44;
    private const int DefaultControlGap = 4;

    /// <summary>
    /// Calculate the expected position for an overlay control
    /// </summary>
    public PositionResult CalculatePosition(
        ContainerSize containerSize,
        PhotoSwipeOverlayControl.OverlayPosition position,
        int spacingIndex = 0,
        PhotoSwipeOverlayControl.GrowDirection direction = PhotoSwipeOverlayControl.GrowDirection.Right,
        int buttonSize = DefaultButtonSize,
        int controlGap = DefaultControlGap,
        string? customOffset = null)
    {
        // Determine if we're in a constrained space (matches component logic)
        var isConstrained = IsConstrainedSpace(position, spacingIndex);

        // Get the effective grow direction (matches GetIntelligentDirection logic)
        var effectiveDirection = GetEffectiveDirection(position, direction, isConstrained);

        // Calculate spacing offset
        var spacingOffset = spacingIndex * (buttonSize + controlGap);

        // Parse custom offset or use default
        var offset = string.IsNullOrEmpty(customOffset) ? DefaultOffset : ParseOffset(customOffset);

        // Calculate base position
        var (baseX, baseY, transform) = CalculateBasePosition(position, containerSize, offset);

        // Apply spacing adjustments
        var (finalX, finalY, finalTransform) = ApplySpacingAdjustments(
            baseX, baseY, transform, position, effectiveDirection, spacingOffset);

        // Generate CSS representation
        var cssPositioning = GenerateCssPositioning(position, offset, spacingIndex, spacingOffset, effectiveDirection);

        return new PositionResult(finalX, finalY, finalTransform, cssPositioning, isConstrained);
    }

    private bool IsConstrainedSpace(PhotoSwipeOverlayControl.OverlayPosition position, int spacingIndex)
    {
        // Matches the component's IsConstrainedSpace logic
        return spacingIndex > 0 &&
               (position == PhotoSwipeOverlayControl.OverlayPosition.BottomRight ||
                position == PhotoSwipeOverlayControl.OverlayPosition.TopRight);
    }

    private PhotoSwipeOverlayControl.GrowDirection GetEffectiveDirection(
        PhotoSwipeOverlayControl.OverlayPosition position,
        PhotoSwipeOverlayControl.GrowDirection explicitDirection,
        bool isConstrained)
    {
        // Matches the component's GetIntelligentDirection logic
        var intelligentDirection = position switch
        {
            PhotoSwipeOverlayControl.OverlayPosition.TopLeft => PhotoSwipeOverlayControl.GrowDirection.Right,
            PhotoSwipeOverlayControl.OverlayPosition.TopRight => isConstrained ? PhotoSwipeOverlayControl.GrowDirection.Down : PhotoSwipeOverlayControl.GrowDirection.Left,
            PhotoSwipeOverlayControl.OverlayPosition.BottomLeft => PhotoSwipeOverlayControl.GrowDirection.Right,
            PhotoSwipeOverlayControl.OverlayPosition.BottomRight => isConstrained ? PhotoSwipeOverlayControl.GrowDirection.Up : PhotoSwipeOverlayControl.GrowDirection.Left,
            PhotoSwipeOverlayControl.OverlayPosition.TopCenter => PhotoSwipeOverlayControl.GrowDirection.Down,
            PhotoSwipeOverlayControl.OverlayPosition.BottomCenter => PhotoSwipeOverlayControl.GrowDirection.Up,
            PhotoSwipeOverlayControl.OverlayPosition.CenterLeft => PhotoSwipeOverlayControl.GrowDirection.Right,
            PhotoSwipeOverlayControl.OverlayPosition.CenterRight => PhotoSwipeOverlayControl.GrowDirection.Left,
            PhotoSwipeOverlayControl.OverlayPosition.Center => PhotoSwipeOverlayControl.GrowDirection.Right,
            _ => PhotoSwipeOverlayControl.GrowDirection.Right
        };

        // Use explicit direction only if not in constrained space
        if (!isConstrained && explicitDirection != PhotoSwipeOverlayControl.GrowDirection.Right)
        {
            return explicitDirection;
        }

        return intelligentDirection;
    }

    private double ParseOffset(string customOffset)
    {
        // Simple parser for CSS units - assumes px for testing
        if (customOffset.EndsWith("px"))
        {
            if (double.TryParse(customOffset[..^2], out var value))
                return value;
        }
        return DefaultOffset;
    }

    private (double X, double Y, string Transform) CalculateBasePosition(
        PhotoSwipeOverlayControl.OverlayPosition position,
        ContainerSize containerSize,
        double offset)
    {
        return position switch
        {
            PhotoSwipeOverlayControl.OverlayPosition.TopLeft =>
                (offset, offset, ""),

            PhotoSwipeOverlayControl.OverlayPosition.TopRight =>
                (containerSize.Width - offset, offset, ""),

            PhotoSwipeOverlayControl.OverlayPosition.TopCenter =>
                (containerSize.Width / 2, offset, "translateX(-50%)"),

            PhotoSwipeOverlayControl.OverlayPosition.BottomLeft =>
                (offset, containerSize.Height - offset, ""),

            PhotoSwipeOverlayControl.OverlayPosition.BottomRight =>
                (containerSize.Width - offset, containerSize.Height - offset, ""),

            PhotoSwipeOverlayControl.OverlayPosition.BottomCenter =>
                (containerSize.Width / 2, containerSize.Height - offset, "translateX(-50%)"),

            PhotoSwipeOverlayControl.OverlayPosition.CenterLeft =>
                (offset, containerSize.Height / 2, "translateY(-50%)"),

            PhotoSwipeOverlayControl.OverlayPosition.CenterRight =>
                (containerSize.Width - offset, containerSize.Height / 2, "translateY(-50%)"),

            PhotoSwipeOverlayControl.OverlayPosition.Center =>
                (containerSize.Width / 2, containerSize.Height / 2, "translate(-50%, -50%)"),

            _ => (offset, offset, "")
        };
    }

    private (double X, double Y, string Transform) ApplySpacingAdjustments(
        double baseX, double baseY, string baseTransform,
        PhotoSwipeOverlayControl.OverlayPosition position,
        PhotoSwipeOverlayControl.GrowDirection direction,
        double spacingOffset)
    {
        if (spacingOffset == 0) return (baseX, baseY, baseTransform);

        var adjustedX = baseX;
        var adjustedY = baseY;
        var transform = baseTransform;

        // Apply spacing based on position and direction (matches component logic)
        var adjustments = (position, direction) switch
        {
            // Top positions
            (PhotoSwipeOverlayControl.OverlayPosition.TopLeft, PhotoSwipeOverlayControl.GrowDirection.Right) =>
                (spacingOffset, 0.0),
            (PhotoSwipeOverlayControl.OverlayPosition.TopLeft, PhotoSwipeOverlayControl.GrowDirection.Down) =>
                (0.0, spacingOffset),
            (PhotoSwipeOverlayControl.OverlayPosition.TopRight, PhotoSwipeOverlayControl.GrowDirection.Left) =>
                (-spacingOffset, 0.0),
            (PhotoSwipeOverlayControl.OverlayPosition.TopRight, PhotoSwipeOverlayControl.GrowDirection.Down) =>
                (0.0, spacingOffset),

            // Bottom positions
            (PhotoSwipeOverlayControl.OverlayPosition.BottomLeft, PhotoSwipeOverlayControl.GrowDirection.Right) =>
                (spacingOffset, 0.0),
            (PhotoSwipeOverlayControl.OverlayPosition.BottomLeft, PhotoSwipeOverlayControl.GrowDirection.Up) =>
                (0.0, -spacingOffset),
            (PhotoSwipeOverlayControl.OverlayPosition.BottomRight, PhotoSwipeOverlayControl.GrowDirection.Left) =>
                (-spacingOffset, 0.0),
            (PhotoSwipeOverlayControl.OverlayPosition.BottomRight, PhotoSwipeOverlayControl.GrowDirection.Up) =>
                (0.0, -spacingOffset),

            // Center positions (top/bottom)
            (PhotoSwipeOverlayControl.OverlayPosition.TopCenter, PhotoSwipeOverlayControl.GrowDirection.Down) =>
                (0.0, spacingOffset),
            (PhotoSwipeOverlayControl.OverlayPosition.BottomCenter, PhotoSwipeOverlayControl.GrowDirection.Up) =>
                (0.0, -spacingOffset),

            // Center positions (left/right)
            (PhotoSwipeOverlayControl.OverlayPosition.CenterLeft, PhotoSwipeOverlayControl.GrowDirection.Right) =>
                (spacingOffset, 0.0),
            (PhotoSwipeOverlayControl.OverlayPosition.CenterRight, PhotoSwipeOverlayControl.GrowDirection.Left) =>
                (-spacingOffset, 0.0),

            _ => (0.0, 0.0)
        };

        adjustedX += adjustments.Item1;
        adjustedY += adjustments.Item2;

        return (adjustedX, adjustedY, transform);
    }

    private string GenerateCssPositioning(
        PhotoSwipeOverlayControl.OverlayPosition position,
        double offset,
        int spacingIndex,
        double spacingOffset,
        PhotoSwipeOverlayControl.GrowDirection direction)
    {
        var offsetStr = $"{offset}px";

        if (spacingIndex == 0)
        {
            // Base positioning without spacing
            return position switch
            {
                PhotoSwipeOverlayControl.OverlayPosition.TopLeft => $"top: {offsetStr}; left: {offsetStr};",
                PhotoSwipeOverlayControl.OverlayPosition.TopRight => $"top: {offsetStr}; right: {offsetStr};",
                PhotoSwipeOverlayControl.OverlayPosition.TopCenter => $"top: {offsetStr}; left: 50%; transform: translateX(-50%);",
                PhotoSwipeOverlayControl.OverlayPosition.BottomLeft => $"bottom: {offsetStr}; left: {offsetStr};",
                PhotoSwipeOverlayControl.OverlayPosition.BottomRight => $"bottom: {offsetStr}; right: {offsetStr};",
                PhotoSwipeOverlayControl.OverlayPosition.BottomCenter => $"bottom: {offsetStr}; left: 50%; transform: translateX(-50%);",
                PhotoSwipeOverlayControl.OverlayPosition.CenterLeft => $"top: 50%; left: {offsetStr}; transform: translateY(-50%);",
                PhotoSwipeOverlayControl.OverlayPosition.CenterRight => $"top: 50%; right: {offsetStr}; transform: translateY(-50%);",
                PhotoSwipeOverlayControl.OverlayPosition.Center => $"top: 50%; left: 50%; transform: translate(-50%, -50%);",
                _ => ""
            };
        }

        // Positioning with spacing applied (matches component GetSpacingStyle logic)
        var spacingOffsetStr = $"{spacingOffset}px";
        return (position, direction) switch
        {
            (PhotoSwipeOverlayControl.OverlayPosition.BottomRight, PhotoSwipeOverlayControl.GrowDirection.Up) =>
                $"bottom: calc({offsetStr} + {spacingOffsetStr});",
            (PhotoSwipeOverlayControl.OverlayPosition.BottomRight, PhotoSwipeOverlayControl.GrowDirection.Left) =>
                $"right: calc({offsetStr} + {spacingOffsetStr});",
            _ => ""
        };
    }
}