using PhotoSwipe.Blazor.Tests.Services;
using PhotoSwipe.Blazor.Components;

namespace PhotoSwipe.Blazor.Tests.Unit;

public class OverlayPositionCalculatorTests
{
    private readonly OverlayPositionCalculator _calculator = new();
    private readonly OverlayPositionCalculator.ContainerSize _standardContainer = new(400, 300);
    private readonly OverlayPositionCalculator.ContainerSize _mobileContainer = new(375, 667); // iPhone size

    [Fact]
    public void CalculatePosition_TopLeft_ReturnsCorrectCoordinates()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopLeft;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position);

        // Assert
        Assert.Equal(12, result.X); // Default offset
        Assert.Equal(12, result.Y); // Default offset
        Assert.Equal("", result.CssTransform);
        Assert.False(result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_TopRight_ReturnsCorrectCoordinates()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopRight;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position);

        // Assert
        Assert.Equal(388, result.X); // 400 - 12
        Assert.Equal(12, result.Y);
        Assert.Equal("", result.CssTransform);
        Assert.False(result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_BottomRight_ReturnsCorrectCoordinates()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position);

        // Assert
        Assert.Equal(388, result.X); // 400 - 12
        Assert.Equal(288, result.Y); // 300 - 12
        Assert.Equal("", result.CssTransform);
        Assert.False(result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_Center_ReturnsCorrectCoordinatesWithTransform()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.Center;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position);

        // Assert
        Assert.Equal(200, result.X); // 400 / 2
        Assert.Equal(150, result.Y); // 300 / 2
        Assert.Equal("translate(-50%, -50%)", result.CssTransform);
        Assert.False(result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_TopCenter_ReturnsCorrectCoordinatesWithTransform()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopCenter;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position);

        // Assert
        Assert.Equal(200, result.X); // 400 / 2
        Assert.Equal(12, result.Y);
        Assert.Equal("translateX(-50%)", result.CssTransform);
        Assert.False(result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_WithSpacingIndex_AppliesSpacingCorrectly()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopLeft;
        var spacingIndex = 1;
        var buttonSize = 44;
        var controlGap = 4;
        var expectedSpacing = spacingIndex * (buttonSize + controlGap); // 48px

        // Act
        var result = _calculator.CalculatePosition(
            _standardContainer, position, spacingIndex,
            PhotoSwipeOverlayControl.GrowDirection.Right, buttonSize, controlGap);

        // Assert
        Assert.Equal(12 + expectedSpacing, result.X); // 12 + 48 = 60
        Assert.Equal(12, result.Y); // Y unchanged for right growth
        Assert.False(result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_BottomRightWithSpacingIndex_IsConstrainedSpace()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;
        var spacingIndex = 1;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position, spacingIndex);

        // Assert
        Assert.True(result.IsConstrained);
        // Should grow UP in constrained space, not left
        Assert.Equal(388, result.X); // X unchanged for up growth
        Assert.Equal(240, result.Y); // 288 - 48 (vertical spacing)
    }

    [Fact]
    public void CalculatePosition_TopRightWithSpacingIndex_IsConstrainedSpace()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopRight;
        var spacingIndex = 2; // Multiple spacing

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position, spacingIndex);

        // Assert
        Assert.True(result.IsConstrained);
        // Should grow DOWN in constrained space
        Assert.Equal(388, result.X); // X unchanged for down growth
        Assert.Equal(108, result.Y); // 12 + (2 * 48) = 108
    }

    [Fact]
    public void CalculatePosition_MobileContainer_WorksCorrectly()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;

        // Act
        var result = _calculator.CalculatePosition(_mobileContainer, position);

        // Assert
        Assert.Equal(363, result.X); // 375 - 12
        Assert.Equal(655, result.Y); // 667 - 12
        Assert.False(result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_CustomOffset_ParsesCorrectly()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopLeft;
        var customOffset = "20px";

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position, customOffset: customOffset);

        // Assert
        Assert.Equal(20, result.X);
        Assert.Equal(20, result.Y);
    }

    [Theory]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.TopLeft, PhotoSwipeOverlayControl.GrowDirection.Right)]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.TopRight, PhotoSwipeOverlayControl.GrowDirection.Left)]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.BottomLeft, PhotoSwipeOverlayControl.GrowDirection.Right)]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.BottomRight, PhotoSwipeOverlayControl.GrowDirection.Left)]
    public void CalculatePosition_AllPositions_ReturnsValidCoordinates(
        PhotoSwipeOverlayControl.OverlayPosition position,
        PhotoSwipeOverlayControl.GrowDirection direction)
    {
        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position, direction: direction);

        // Assert
        Assert.True(result.X >= 0);
        Assert.True(result.Y >= 0);
        Assert.True(result.X <= _standardContainer.Width);
        Assert.True(result.Y <= _standardContainer.Height);
        Assert.NotNull(result.CssPositioning);
    }

    [Fact]
    public void CalculatePosition_ConstrainedSpaceOverridesExplicitDirection()
    {
        // Arrange - bottom right with spacing should force UP direction regardless of explicit direction
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;
        var spacingIndex = 1;
        var explicitDirection = PhotoSwipeOverlayControl.GrowDirection.Right; // Explicit right
        var baseY = _standardContainer.Height - 12; // 288

        // Act
        var result = _calculator.CalculatePosition(
            _standardContainer, position, spacingIndex, explicitDirection);

        // Assert
        Assert.True(result.IsConstrained);
        // Y should decrease (going up) despite explicit right direction
        Assert.True(result.Y < baseY, $"Expected Y < {baseY}, but got {result.Y}");
        // X should remain unchanged for vertical growth
        Assert.Equal(_standardContainer.Width - 12, result.X);
    }

    [Fact]
    public void CalculatePosition_NonConstrainedSpaceRespectsExplicitDirection()
    {
        // Arrange - top left with spacing and explicit down direction
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopLeft;
        var spacingIndex = 1;
        var explicitDirection = PhotoSwipeOverlayControl.GrowDirection.Down;
        var baseY = 12;

        // Act
        var result = _calculator.CalculatePosition(
            _standardContainer, position, spacingIndex, explicitDirection);

        // Assert
        Assert.False(result.IsConstrained);
        // Y should increase (going down) per explicit direction
        Assert.True(result.Y > baseY, $"Expected Y > {baseY}, but got {result.Y}");
        // X should remain unchanged for vertical growth
        Assert.Equal(12, result.X);
    }

    [Theory]
    [InlineData(0, false)] // No spacing = not constrained
    [InlineData(1, true)]  // Spacing at bottom-right = constrained
    [InlineData(2, true)]  // Multiple spacing = constrained
    public void CalculatePosition_ConstrainedSpaceDetection_WorksCorrectly(int spacingIndex, bool expectedConstrained)
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position, spacingIndex);

        // Assert
        Assert.Equal(expectedConstrained, result.IsConstrained);
    }

    [Fact]
    public void CalculatePosition_GeneratesCssPositioning()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position);

        // Assert
        Assert.NotEmpty(result.CssPositioning);
        Assert.Contains("bottom: 12px", result.CssPositioning);
        Assert.Contains("right: 12px", result.CssPositioning);
    }

    [Fact]
    public void CalculatePosition_WithSpacing_GeneratesCssWithCalc()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;
        var spacingIndex = 1;

        // Act
        var result = _calculator.CalculatePosition(_standardContainer, position, spacingIndex);

        // Assert
        Assert.NotEmpty(result.CssPositioning);
        // Should contain calc() for spacing
        Assert.Contains("calc", result.CssPositioning);
        Assert.Contains("48px", result.CssPositioning); // spacing offset
    }
}