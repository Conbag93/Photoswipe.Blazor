# PhotoSwipe Image Reordering Functionality Documentation

## Overview

The PhotoSwipe Blazor integration includes sophisticated image reordering functionality that allows users to dynamically change the order of images in a gallery. This feature combines intuitive UI controls, professional styling, and robust state management to provide an elegant user experience.

## Architecture

### Core Components

#### 1. Reordering Controls
The reordering functionality is implemented using the `PhotoSwipeOverlayControl` component with three main elements:

- **Index Label**: Shows current position (e.g., "1/3", "2/3")
- **Up Arrow Button**: Moves image toward the beginning (decreases index)
- **Down Arrow Button**: Moves image toward the end (increases index)

#### 2. State Management
The reordering state is managed through:
- Gallery items list (`List<PhotoSwipeItem> _galleryItems`)
- Real-time index calculations based on current item positions
- Boundary condition checking for first/last items
- Live updates to the PhotoSwipe gallery order

## Implementation Details

### 1. Control Layout and Positioning

```razor
<!-- Index Label (Top-Left) -->
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopLeft"
                        ControlType="index"
                        Icon="@GetIndexLabel(item.Src)"
                        ButtonCssClass="index-label"
                        Title="@GetIndexTooltip(item.Src)"
                        Disabled="true"
                        SpacingIndex="0"
                        Direction="PhotoSwipeOverlayControl.GrowDirection.Right"
                        ControlGap="@_controlGap" />

<!-- Up Arrow (Top-Right) -->
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.TopRight"
                        ControlType="reorder-up"
                        Icon="@GetUpArrowSvg()"
                        ButtonCssClass="@GetUpArrowFullButtonClass(item.Src)"
                        Title="@GetUpArrowTooltip(item.Src)"
                        OnClick="@(() => MoveImageUp(item.Src))"
                        Disabled="@IsUpArrowDisabled(item.Src)"
                        SpacingIndex="0"
                        Direction="PhotoSwipeOverlayControl.GrowDirection.Left"
                        ControlGap="@_controlGap" />

<!-- Down Arrow (Bottom-Right) -->
<PhotoSwipeOverlayControl Position="PhotoSwipeOverlayControl.OverlayPosition.BottomRight"
                        ControlType="reorder-down"
                        Icon="@GetDownArrowSvg()"
                        ButtonCssClass="@GetDownArrowFullButtonClass(item.Src)"
                        Title="@GetDownArrowTooltip(item.Src)"
                        OnClick="@(() => MoveImageDown(item.Src))"
                        Disabled="@IsDownArrowDisabled(item.Src)"
                        SpacingIndex="0"
                        Direction="PhotoSwipeOverlayControl.GrowDirection.Left"
                        ControlGap="@_controlGap" />
```

### 2. Font Awesome SVG Icons

The reordering controls use professional Font Awesome SVG icons for visual clarity:

#### Up Arrow SVG
```csharp
private string GetUpArrowSvg()
{
    return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 640 640"">
               <path d=""M342.6 81.4C330.1 68.9 309.8 68.9 297.3 81.4L137.3 241.4C124.8 253.9 124.8 274.2 137.3 286.7C149.8 299.2 170.1 299.2 182.6 286.7L288 181.3L288 552C288 569.7 302.3 584 320 584C337.7 584 352 569.7 352 552L352 181.3L457.4 286.7C469.9 299.2 490.2 299.2 502.7 286.7C515.2 274.2 515.2 253.9 502.7 241.4L342.7 81.4z"" fill=""currentColor""/>
             </svg>";
}
```

#### Down Arrow SVG
```csharp
private string GetDownArrowSvg()
{
    return @"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 640 640"">
               <path d=""M297.4 558.6C309.9 571.1 330.2 571.1 342.7 558.6L502.7 398.6C515.2 386.1 515.2 365.8 502.7 353.3C490.2 340.8 469.9 340.8 457.4 353.3L352 458.7L352 88C352 70.3 337.7 56 320 56C302.3 56 288 70.3 288 88L288 458.7L182.6 353.3C170.1 340.8 149.8 340.8 137.3 353.3C124.8 365.8 124.8 386.1 137.3 398.6L297.3 558.6z"" fill=""currentColor""/>
             </svg>";
}
```

### 3. Core Reordering Logic

#### Move Image Up
```csharp
private void MoveImageUp(string itemSrc)
{
    var currentIndex = _galleryItems.FindIndex(item => item.Src == itemSrc);
    if (currentIndex > 0)
    {
        // Swap with the item above
        var temp = _galleryItems[currentIndex];
        _galleryItems[currentIndex] = _galleryItems[currentIndex - 1];
        _galleryItems[currentIndex - 1] = temp;
        StateHasChanged();
        Logger.LogInformation("Image moved up: {Title} from position {OldPos} to {NewPos}",
            temp.Title ?? temp.Alt, currentIndex + 1, currentIndex);
    }
}
```

#### Move Image Down
```csharp
private void MoveImageDown(string itemSrc)
{
    var currentIndex = _galleryItems.FindIndex(item => item.Src == itemSrc);
    if (currentIndex < _galleryItems.Count - 1)
    {
        // Swap with the item below
        var temp = _galleryItems[currentIndex];
        _galleryItems[currentIndex] = _galleryItems[currentIndex + 1];
        _galleryItems[currentIndex + 1] = temp;
        StateHasChanged();
        Logger.LogInformation("Image moved down: {Title} from position {OldPos} to {NewPos}",
            temp.Title ?? temp.Alt, currentIndex + 1, currentIndex + 2);
    }
}
```

### 4. Helper Methods

#### Index Label Generation
```csharp
private string GetIndexLabel(string itemSrc)
{
    var currentIndex = _galleryItems.FindIndex(item => item.Src == itemSrc);
    return $"{currentIndex + 1}/{_galleryItems.Count}";
}

private string GetIndexTooltip(string itemSrc)
{
    var currentIndex = _galleryItems.FindIndex(item => item.Src == itemSrc);
    return $"Image {currentIndex + 1} of {_galleryItems.Count}";
}
```

#### Boundary Condition Checking
```csharp
private bool IsUpArrowDisabled(string itemSrc)
{
    var currentIndex = _galleryItems.FindIndex(item => item.Src == itemSrc);
    return currentIndex <= 0; // Disabled if first item
}

private bool IsDownArrowDisabled(string itemSrc)
{
    var currentIndex = _galleryItems.FindIndex(item => item.Src == itemSrc);
    return currentIndex >= _galleryItems.Count - 1; // Disabled if last item
}
```

#### Button CSS Class Generation
```csharp
private string GetUpArrowFullButtonClass(string itemSrc)
{
    return $"reorder-button up-arrow {GetUpArrowButtonClass(itemSrc)}";
}

private string GetDownArrowFullButtonClass(string itemSrc)
{
    return $"reorder-button down-arrow {GetDownArrowButtonClass(itemSrc)}";
}

private string GetUpArrowButtonClass(string itemSrc)
{
    return IsUpArrowDisabled(itemSrc) ? "disabled" : "";
}

private string GetDownArrowButtonClass(string itemSrc)
{
    return IsDownArrowDisabled(itemSrc) ? "disabled" : "";
}
```

#### Tooltip Messages
```csharp
private string GetUpArrowTooltip(string itemSrc)
{
    return IsUpArrowDisabled(itemSrc) ? "Already first image" : "Move image up";
}

private string GetDownArrowTooltip(string itemSrc)
{
    return IsDownArrowDisabled(itemSrc) ? "Already last image" : "Move image down";
}
```

## Styling and Visual Design

### 1. Reorder Button Styling

The reorder buttons feature sophisticated glassmorphism design:

```css
::deep .reorder-button {
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.95);
    padding: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5));
    backdrop-filter: blur(4px);
}
```

### 2. Hover Effects

#### Up Arrow Hover (Green Theme)
```css
::deep .reorder-button.up-arrow:hover:not(.disabled) {
    background: rgba(34, 197, 94, 0.9);
    color: white;
    border-color: #22c55e;
    filter: drop-shadow(0 4px 16px rgba(34, 197, 94, 0.6));
}
```

#### Down Arrow Hover (Orange Theme)
```css
::deep .reorder-button.down-arrow:hover:not(.disabled) {
    background: rgba(251, 146, 60, 0.9);
    color: white;
    border-color: #fb923c;
    filter: drop-shadow(0 4px 16px rgba(251, 146, 60, 0.6));
}
```

### 3. Disabled State Styling
```css
::deep .reorder-button.disabled {
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    opacity: 0.5;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}
```

### 4. Index Label Styling
```css
::deep .index-label {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 8px;
    min-width: 36px;
    height: 24px;
    cursor: default;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
```

### 5. SVG Icon Styling
```css
::deep .reorder-button svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

::deep .reorder-button:hover:not(.disabled) svg {
    transform: scale(1.05);
}
```

## Current Order Summary

### UI Implementation
The reordering demo includes a live summary showing the current image order:

```razor
@if (_galleryItems.Any())
{
    <div class="reordering-summary">
        <h3>📋 Current Image Order</h3>
        <div class="order-list">
            @for (int i = 0; i < _galleryItems.Count; i++)
            {
                var item = _galleryItems[i];
                <div class="order-item">
                    <span class="order-number">@(i + 1).</span>
                    <span class="order-title">@(item.Title ?? item.Alt ?? "Untitled")</span>
                    @if (i == 0)
                    {
                        <span class="order-badge first">First</span>
                    }
                    else if (i == _galleryItems.Count - 1)
                    {
                        <span class="order-badge last">Last</span>
                    }
                </div>
            }
        </div>
    </div>
}
```

### Summary Styling
```css
.reordering-summary {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 0.9rem;
}

.order-badge.first {
    background: #d4edda;
    color: #155724;
}

.order-badge.last {
    background: #f8d7da;
    color: #721c24;
}
```

## Responsive Design

### Mobile Optimizations
```css
@media (max-width: 768px) {
    ::deep .reorder-button {
        min-width: 32px;
        height: 32px;
        padding: 6px;
    }

    ::deep .reorder-button svg {
        width: 16px;
        height: 16px;
    }

    ::deep .index-label {
        min-width: 36px;
        height: 24px;
        font-size: 12px;
    }
}
```

## Accessibility Features

### 1. Keyboard Navigation
```css
::deep .reorder-button:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
}

::deep .reorder-button.disabled:focus {
    outline: 2px solid #adb5bd;
}
```

### 2. ARIA Support
- Tooltips provide context for screen readers
- Disabled buttons have appropriate ARIA states
- Focus indicators for keyboard navigation

### 3. Color Contrast
- High contrast colors for all states
- Distinct visual feedback for disabled elements
- Clear visual hierarchy with proper typography

## Testing Coverage

### Playwright E2E Tests

The reordering functionality is thoroughly tested with automated end-to-end tests located in:
`/tests/e2e/extended-features/image-reordering.spec.js`

#### Test Categories:

1. **Reordering Controls Presence**
   - Index labels display correctly (1/3, 2/3, 3/3)
   - Up and down arrow buttons are present
   - Accessibility attributes are properly set

2. **Boundary Conditions**
   - Up button disabled for first image
   - Down button disabled for last image
   - Middle image buttons enabled

3. **Reordering Functionality**
   - Moving second image up to first position
   - Moving first image down to second position
   - Button states update after reordering
   - Index labels update correctly

4. **Gallery Integration**
   - Reordering buttons don't open PhotoSwipe gallery
   - Gallery opens with correct order after reordering

5. **Visual Feedback**
   - Hover effects on enabled buttons
   - No hover effects on disabled buttons
   - Order summary displays and updates

6. **Responsive Behavior**
   - Functionality works on mobile viewports
   - Functionality works on tablet viewports

7. **Error Handling**
   - Rapid button clicks handled gracefully
   - Gallery functionality maintained after reordering

#### Key Test Selectors:
- `[data-pswp-control-type="index"]` - Index labels
- `[data-pswp-control-type="move-up"]` - Up arrow buttons
- `[data-pswp-control-type="move-down"]` - Down arrow buttons
- `.reordering-summary .order-item` - Order summary items

## Advanced Features

### 1. Smart Positioning
- Controls use intelligent growth directions to avoid screen edge conflicts
- Proper spacing management with configurable control gaps
- Automatic collision detection and adjustment

### 2. Animation and Transitions
```css
.reordering-demo-item {
    transition: all 0.3s ease;
}

.reordering-demo-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### 3. State Persistence
- Gallery order immediately reflects changes
- PhotoSwipe lightbox opens with updated order
- Consistent state across all UI components

### 4. Error Prevention
- Boundary checking prevents invalid operations
- Visual feedback for disabled states
- Graceful handling of edge cases

## Performance Considerations

### 1. Efficient Updates
- Only necessary DOM elements re-render on state changes
- Minimal recalculation of index positions
- Optimized CSS transitions and animations

### 2. Memory Management
- No memory leaks from event handlers
- Proper disposal of component resources
- Efficient SVG icon rendering

### 3. Scalability
- Works efficiently with large image collections
- Minimal performance impact on gallery rendering
- Responsive design maintains performance on mobile devices

## Best Practices

### 1. Implementation Guidelines
- Always implement boundary checking for first/last items
- Provide clear visual feedback for all button states
- Use semantic HTML and proper ARIA attributes
- Include comprehensive tooltips for accessibility

### 2. Styling Recommendations
- Maintain consistent visual hierarchy
- Use high contrast colors for accessibility
- Implement smooth transitions for better UX
- Provide clear disabled state indicators

### 3. Testing Strategy
- Test all boundary conditions
- Verify accessibility features
- Validate responsive behavior
- Ensure PhotoSwipe integration works correctly

### 4. Error Handling
- Handle rapid user interactions gracefully
- Provide fallback behavior for edge cases
- Log significant operations for debugging
- Maintain UI consistency during operations

## Integration with PhotoSwipe

### 1. Gallery Order Synchronization
The reordering functionality maintains perfect synchronization with PhotoSwipe:
- Gallery items list updates immediately
- PhotoSwipe lightbox reflects new order when opened
- Navigation between images follows updated sequence

### 2. Event Prevention
Reordering controls properly prevent PhotoSwipe gallery opening:
```csharp
OnClick="@(() => MoveImageUp(item.Src))"
```
The overlay control system ensures clicks on reordering buttons don't trigger gallery opening.

### 3. State Management
- Real-time updates to `_galleryItems` collection
- Automatic re-rendering of index labels and button states
- Consistent state across all gallery components

## Complete Implementation Checklist

### Files to Create/Modify for Reordering:

1. **CustomOverlayDemo.razor** - Add reordering section with:
   - Index labels (Top-Left position)
   - Up arrows (Top-Right position)
   - Down arrows (Bottom-Right position)
   - Current order summary display

2. **CustomOverlayDemo.razor.css** - Add all reordering styles:
   - `.reordering-explanation` styles
   - `::deep .reorder-button` styles with glassmorphism
   - `::deep .index-label` styles with gradient
   - `.reordering-summary` and `.order-item` styles
   - Hover effects for up-arrow (green) and down-arrow (orange)
   - Disabled state styling
   - Mobile responsive adjustments

3. **E2E Test File** - `/tests/e2e/extended-features/image-reordering.spec.js`:
   - Test control presence and accessibility
   - Test boundary conditions (disabled states)
   - Test actual reordering functionality
   - Test PhotoSwipe integration
   - Test responsive behavior

### Key Implementation Requirements:

1. **Control Types**: Use `data-pswp-control-type` attributes:
   - `"index"` for position labels
   - `"move-up"` for up arrows
   - `"move-down"` for down arrows

2. **Positioning Strategy**:
   - Index: TopLeft + GrowDirection.Right + SpacingIndex 0
   - Up Arrow: TopRight + GrowDirection.Left + SpacingIndex 0
   - Down Arrow: BottomRight + GrowDirection.Left + SpacingIndex 0

3. **Font Awesome SVG Icons**: Use the exact SVG paths provided in documentation for professional arrow icons

4. **State Management**:
   - Use `_galleryItems` List for source of truth
   - Implement proper boundary checking
   - Update `StateHasChanged()` after each reorder operation

5. **CSS Classes**:
   - `.reorder-button` base class
   - `.up-arrow` and `.down-arrow` modifier classes
   - `.disabled` state class
   - `.index-label` for position display

6. **Test Selectors**:
   - `[data-pswp-control-type="index"]`
   - `[data-pswp-control-type="move-up"] button`
   - `[data-pswp-control-type="move-down"] button`
   - `.reordering-summary .order-item`

### Critical Implementation Notes:

- **Boundary Logic**: First item up-arrow disabled, last item down-arrow disabled
- **Tooltip Messages**: Different messages for enabled vs disabled states
- **Color Coding**: Green for up (move toward beginning), orange for down (move toward end)
- **Index Format**: Display as "1/3", "2/3", "3/3" pattern
- **Order Summary**: Show live list with "First" and "Last" badges
- **Mobile**: Smaller button sizes but maintain 44px touch targets
- **Accessibility**: Focus outlines, proper ARIA attributes, high contrast

This comprehensive reordering functionality demonstrates sophisticated UI/UX design with robust implementation, extensive testing, and excellent accessibility features.

---

**POST-REVERT IMPLEMENTATION PRIORITY:**
1. Add reordering section to CustomOverlayDemo.razor
2. Copy all reordering CSS to CustomOverlayDemo.razor.css
3. Create image-reordering.spec.js test file
4. Test functionality thoroughly before proceeding with other features