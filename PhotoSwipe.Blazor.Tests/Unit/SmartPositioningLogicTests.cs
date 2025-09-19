using PhotoSwipe.Blazor.Tests.Services;
using PhotoSwipe.Blazor.Components;

namespace PhotoSwipe.Blazor.Tests.Unit;

/// <summary>
/// Tests specifically for the smart positioning logic that handles
/// intelligent direction selection and constrained space detection
/// </summary>
public class SmartPositioningLogicTests
{
    private readonly OverlayPositionCalculator _calculator = new();
    private readonly OverlayPositionCalculator.ContainerSize _mobileContainer = new(375, 667); // iPhone
    private readonly OverlayPositionCalculator.ContainerSize _tabletContainer = new(768, 1024); // iPad
    private readonly OverlayPositionCalculator.ContainerSize _desktopContainer = new(1920, 1080); // Desktop

    [Theory]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.TopLeft, PhotoSwipeOverlayControl.GrowDirection.Right)]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.TopCenter, PhotoSwipeOverlayControl.GrowDirection.Down)]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.BottomCenter, PhotoSwipeOverlayControl.GrowDirection.Up)]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.CenterLeft, PhotoSwipeOverlayControl.GrowDirection.Right)]
    [InlineData(PhotoSwipeOverlayControl.OverlayPosition.CenterRight, PhotoSwipeOverlayControl.GrowDirection.Left)]
    public void SmartPositioning_IntelligentDirectionDefaults_AreCorrect(
        PhotoSwipeOverlayControl.OverlayPosition position,
        PhotoSwipeOverlayControl.GrowDirection expectedDirection)
    {
        // Arrange - no spacing index means not constrained, should use intelligent defaults
        var spacingIndex = 0;
        var explicitDirection = PhotoSwipeOverlayControl.GrowDirection.Right; // Different from expected

        // Act
        var result = _calculator.CalculatePosition(
            _mobileContainer, position, spacingIndex, explicitDirection);

        // Assert - verify the direction is applied by checking coordinate changes
        var baseResult = _calculator.CalculatePosition(_mobileContainer, position, 0);
        var spacedResult = _calculator.CalculatePosition(_mobileContainer, position, 1, explicitDirection);

        // The spacing should follow the expected intelligent direction
        VerifyDirectionApplication(baseResult, spacedResult, expectedDirection);
    }

    [Fact]
    public void SmartPositioning_BottomRightConstrained_ForcesVerticalStacking()
    {
        // Arrange - this is the specific case that was causing mobile issues
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;
        var deleteButtonSpacing = 0; // Delete button (first)
        var downArrowSpacing = 1;    // Down arrow (second)

        // Act
        var deleteResult = _calculator.CalculatePosition(
            _mobileContainer, position, deleteButtonSpacing);
        var arrowResult = _calculator.CalculatePosition(
            _mobileContainer, position, downArrowSpacing);

        // Assert
        Assert.False(deleteResult.IsConstrained); // First button not constrained
        Assert.True(arrowResult.IsConstrained);   // Second button is constrained

        // Arrow should be ABOVE delete button (vertical stacking)
        Assert.True(arrowResult.Y < deleteResult.Y,
            $"Arrow Y ({arrowResult.Y}) should be above delete Y ({deleteResult.Y})");

        // X coordinates should be the same (vertical stacking, not horizontal)
        Assert.Equal(deleteResult.X, arrowResult.X);
    }

    [Fact]
    public void SmartPositioning_TopRightConstrained_ForcesVerticalStacking()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopRight;
        var firstButton = 0;
        var secondButton = 1;

        // Act
        var firstResult = _calculator.CalculatePosition(
            _mobileContainer, position, firstButton);
        var secondResult = _calculator.CalculatePosition(
            _mobileContainer, position, secondButton);

        // Assert
        Assert.False(firstResult.IsConstrained);
        Assert.True(secondResult.IsConstrained);

        // Second button should be BELOW first button (growing down)
        Assert.True(secondResult.Y > firstResult.Y,
            $"Second Y ({secondResult.Y}) should be below first Y ({firstResult.Y})");

        // X coordinates should be the same
        Assert.Equal(firstResult.X, secondResult.X);
    }

    [Fact]
    public void SmartPositioning_NonConstrainedCorners_AllowHorizontalGrowth()
    {
        // Arrange - left corners should allow horizontal growth
        var positions = new[]
        {
            PhotoSwipeOverlayControl.OverlayPosition.TopLeft,
            PhotoSwipeOverlayControl.OverlayPosition.BottomLeft
        };

        foreach (var position in positions)
        {
            // Act
            var firstResult = _calculator.CalculatePosition(_mobileContainer, position, 0);
            var secondResult = _calculator.CalculatePosition(_mobileContainer, position, 1);

            // Assert
            Assert.False(firstResult.IsConstrained);
            Assert.False(secondResult.IsConstrained); // Left positions don't become constrained

            // Should grow horizontally (X changes, Y stays same)
            Assert.True(secondResult.X > firstResult.X,
                $"For {position}: Second X ({secondResult.X}) should be right of first X ({firstResult.X})");
            Assert.Equal(firstResult.Y, secondResult.Y);
        }
    }

    [Theory]
    [InlineData(0, false)] // Single button
    [InlineData(1, true)]  // Two buttons - constrained
    [InlineData(2, true)]  // Three buttons - still constrained
    [InlineData(3, true)]  // Four buttons - definitely constrained
    public void SmartPositioning_ConstrainedSpaceDetection_ScalesWithButtonCount(
        int spacingIndex, bool expectedConstrained)
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;

        // Act
        var result = _calculator.CalculatePosition(_mobileContainer, position, spacingIndex);

        // Assert
        Assert.Equal(expectedConstrained, result.IsConstrained);
    }

    [Fact]
    public void SmartPositioning_ExplicitDirectionOverride_WorksInNonConstrainedSpace()
    {
        // Arrange - top left is never constrained, should respect explicit direction
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopLeft;
        var spacingIndex = 1;
        var explicitDirection = PhotoSwipeOverlayControl.GrowDirection.Down; // Override default Right

        // Act
        var result = _calculator.CalculatePosition(
            _mobileContainer, position, spacingIndex, explicitDirection);

        // Assert
        Assert.False(result.IsConstrained);

        // Verify the explicit direction was used (down = Y increases)
        var baseResult = _calculator.CalculatePosition(_mobileContainer, position, 0);
        Assert.True(result.Y > baseResult.Y);
        Assert.Equal(baseResult.X, result.X);
    }

    [Fact]
    public void SmartPositioning_ConstrainedSpaceIgnoresExplicitDirection()
    {
        // Arrange - constrained space should ignore explicit direction
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;
        var spacingIndex = 1;
        var explicitDirection = PhotoSwipeOverlayControl.GrowDirection.Right; // Try to force horizontal

        // Act
        var result = _calculator.CalculatePosition(
            _mobileContainer, position, spacingIndex, explicitDirection);

        // Assert
        Assert.True(result.IsConstrained);

        // Should still grow UP despite explicit RIGHT direction
        var baseResult = _calculator.CalculatePosition(_mobileContainer, position, 0);
        Assert.True(result.Y < baseResult.Y);
        Assert.Equal(baseResult.X, result.X);
    }

    [Theory]
    [InlineData(375, 667)]   // iPhone
    [InlineData(414, 896)]   // iPhone Pro Max
    [InlineData(390, 844)]   // iPhone 12/13
    [InlineData(360, 640)]   // Android common
    public void SmartPositioning_VariousMobileSizes_HandleConstrainedSpaceConsistently(
        double width, double height)
    {
        // Arrange
        var container = new OverlayPositionCalculator.ContainerSize(width, height);
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;

        // Act
        var deleteButton = _calculator.CalculatePosition(container, position, 0);
        var downArrow = _calculator.CalculatePosition(container, position, 1);

        // Assert - consistent behavior across all mobile sizes
        Assert.False(deleteButton.IsConstrained);
        Assert.True(downArrow.IsConstrained);
        Assert.True(downArrow.Y < deleteButton.Y);
        Assert.Equal(deleteButton.X, downArrow.X);
    }

    [Fact]
    public void SmartPositioning_DesktopSizes_StillRespectConstrainedLogic()
    {
        // Arrange - even on desktop, constrained logic should apply for multiple buttons
        var position = PhotoSwipeOverlayControl.OverlayPosition.BottomRight;

        // Act
        var firstButton = _calculator.CalculatePosition(_desktopContainer, position, 0);
        var secondButton = _calculator.CalculatePosition(_desktopContainer, position, 1);

        // Assert - constrained logic is about button count, not screen size
        Assert.False(firstButton.IsConstrained);
        Assert.True(secondButton.IsConstrained);
        Assert.True(secondButton.Y < firstButton.Y);
    }

    [Fact]
    public void SmartPositioning_ButtonSizeAffectsSpacing()
    {
        // Arrange
        var position = PhotoSwipeOverlayControl.OverlayPosition.TopLeft;
        var spacingIndex = 1;
        var smallButtonSize = 32;
        var largeButtonSize = 56;
        var controlGap = 4;

        // Act
        var smallResult = _calculator.CalculatePosition(
            _mobileContainer, position, spacingIndex, buttonSize: smallButtonSize, controlGap: controlGap);
        var largeResult = _calculator.CalculatePosition(
            _mobileContainer, position, spacingIndex, buttonSize: largeButtonSize, controlGap: controlGap);

        // Assert
        var baseResult = _calculator.CalculatePosition(_mobileContainer, position, 0);

        // Larger buttons should create more spacing
        var smallSpacing = smallResult.X - baseResult.X; // 32 + 4 = 36
        var largeSpacing = largeResult.X - baseResult.X; // 56 + 4 = 60

        Assert.Equal(36, smallSpacing);
        Assert.Equal(60, largeSpacing);
        Assert.True(largeSpacing > smallSpacing);
    }

    private void VerifyDirectionApplication(
        OverlayPositionCalculator.PositionResult baseResult,
        OverlayPositionCalculator.PositionResult spacedResult,
        PhotoSwipeOverlayControl.GrowDirection expectedDirection)
    {
        switch (expectedDirection)
        {
            case PhotoSwipeOverlayControl.GrowDirection.Right:
                Assert.True(spacedResult.X > baseResult.X);
                Assert.Equal(baseResult.Y, spacedResult.Y);
                break;

            case PhotoSwipeOverlayControl.GrowDirection.Left:
                Assert.True(spacedResult.X < baseResult.X);
                Assert.Equal(baseResult.Y, spacedResult.Y);
                break;

            case PhotoSwipeOverlayControl.GrowDirection.Down:
                Assert.True(spacedResult.Y > baseResult.Y);
                Assert.Equal(baseResult.X, spacedResult.X);
                break;

            case PhotoSwipeOverlayControl.GrowDirection.Up:
                Assert.True(spacedResult.Y < baseResult.Y);
                Assert.Equal(baseResult.X, spacedResult.X);
                break;
        }
    }
}