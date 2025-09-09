using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Microsoft.Extensions.Logging;
using PhotoSwipe.Blazor.Models;
using System.Text.Json;

namespace PhotoSwipe.Blazor.Services;

/// <summary>
/// PhotoSwipe JavaScript Interop Service
/// 
/// This service communicates with the JavaScript wrapper located at:
/// wwwroot/photoswipe-simple.js (SINGLE SOURCE OF TRUTH)
/// 
/// All PhotoSwipe functionality must be modified in that JavaScript file.
/// Do NOT create additional wrapper files.
/// </summary>
public class PhotoSwipeInterop : IAsyncDisposable
{
    private readonly IJSRuntime _jsRuntime;
    private readonly DotNetObjectReference<PhotoSwipeInterop> _dotNetReference;
    private readonly Dictionary<string, EventCallback<PhotoSwipeEventArgs>> _eventHandlers = new();
    private readonly ILogger<PhotoSwipeInterop>? _logger;

    public PhotoSwipeInterop(IJSRuntime jsRuntime, ILogger<PhotoSwipeInterop>? logger = null)
    {
        _jsRuntime = jsRuntime;
        _dotNetReference = DotNetObjectReference.Create(this);
        _logger = logger;
    }

    /// <summary>
    /// Ensures PhotoSwipe simple wrapper is available
    /// </summary>
    private async Task EnsurePhotoSwipeReadyAsync()
    {
        var maxAttempts = 30; // 3 seconds max wait
        var attempt = 0;
        
        while (attempt < maxAttempts)
        {
            try
            {
                var isReady = await _jsRuntime.InvokeAsync<bool>("eval", "typeof window.PhotoSwipeBlazor !== 'undefined'");
                if (isReady)
                {
                    _logger?.LogDebug("✅ PhotoSwipeBlazor wrapper ready (attempt {Attempt})", attempt + 1);
                    return;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogDebug("⏳ PhotoSwipeBlazor not ready yet (attempt {Attempt}): {Error}", attempt + 1, ex.Message);
            }
            
            attempt++;
            await Task.Delay(100); // Wait 100ms between attempts
        }
        
        var error = "PhotoSwipeBlazor wrapper not ready. Ensure photoswipe-simple.js is loaded.";
        _logger?.LogError("❌ {Error}", error);
        throw new InvalidOperationException(error);
    }

    public async Task<string> InitializeLightboxAsync(string elementId, PhotoSwipeOptions? options = null)
    {
        var startTime = DateTimeOffset.Now;
        
        if (string.IsNullOrEmpty(elementId))
        {
            var error = "ElementId cannot be null or empty";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentException(error, nameof(elementId));
        }
        
        try
        {
            _logger?.LogInformation("🚀 Initializing PhotoSwipe lightbox for element {ElementId}", elementId);
            
            // Wait for PhotoSwipe wrapper to be ready
            await EnsurePhotoSwipeReadyAsync();
            
            _logger?.LogDebug("⚙️ Initializing lightbox with options: {Options}", options?.ToString() ?? "null");
            
            // Use simple wrapper approach following ViewerJsBlazor pattern
            await _jsRuntime.InvokeAsync<object>(
                "window.PhotoSwipeBlazor.create", elementId, options, _dotNetReference);
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe lightbox initialized successfully for element {ElementId} in {Duration}ms", 
                elementId, duration.TotalMilliseconds);
                
            return elementId; // Return elementId as the instance identifier
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error initializing PhotoSwipe lightbox for element {ElementId} after {Duration}ms: {Error}", 
                elementId, duration.TotalMilliseconds, ex.Message);
            throw;
        }
    }

    public async Task<string> InitializeGalleryAsync(string elementId, IEnumerable<PhotoSwipeItem> items, PhotoSwipeOptions? options = null)
    {
        var startTime = DateTimeOffset.Now;
        
        if (string.IsNullOrEmpty(elementId))
        {
            var error = "ElementId cannot be null or empty";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentException(error, nameof(elementId));
        }
        
        if (items == null)
        {
            var error = "Items cannot be null";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentNullException(nameof(items), error);
        }
        
        var itemList = items.ToList();
        
        try
        {
            _logger?.LogInformation("📊 Initializing PhotoSwipe gallery for element {ElementId} with {ItemCount} items", elementId, itemList.Count);
            
            // Wait for PhotoSwipe to be ready
            await EnsurePhotoSwipeReadyAsync();
            
            // Use simple wrapper approach following ViewerJsBlazor pattern
            await _jsRuntime.InvokeAsync<object>(
                "window.PhotoSwipeBlazor.create", elementId, options, _dotNetReference);
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe gallery initialized successfully for element {ElementId} with {ItemCount} items in {Duration}ms", 
                elementId, itemList.Count, duration.TotalMilliseconds);
                
            return elementId; // Return elementId as the instance identifier
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error initializing PhotoSwipe gallery for element {ElementId} with {ItemCount} items after {Duration}ms: {Error}", 
                elementId, itemList.Count, duration.TotalMilliseconds, ex.Message);
            throw;
        }
    }

    public async Task<string> CreateFromDataAsync(string instanceId, IEnumerable<PhotoSwipeItem> items, PhotoSwipeOptions? options = null, int openIndex = 0)
    {
        var startTime = DateTimeOffset.Now;
        
        if (string.IsNullOrEmpty(instanceId))
        {
            var error = "InstanceId cannot be null or empty";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentException(error, nameof(instanceId));
        }
        
        if (items == null)
        {
            var error = "Items cannot be null";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentNullException(nameof(items), error);
        }
        
        var itemList = items.ToList();
        
        try
        {
            _logger?.LogInformation("📊 Creating PhotoSwipe from data for instance {InstanceId} with {ItemCount} items", instanceId, itemList.Count);
            
            // Wait for PhotoSwipe to be ready
            await EnsurePhotoSwipeReadyAsync();
            
            // Use data-based creation method
            await _jsRuntime.InvokeAsync<object>(
                "window.PhotoSwipeBlazor.createFromData", instanceId, itemList, options, _dotNetReference, openIndex);
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe data instance created successfully for {InstanceId} with {ItemCount} items in {Duration}ms", 
                instanceId, itemList.Count, duration.TotalMilliseconds);
                
            return instanceId; // Return instanceId as the instance identifier
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error creating PhotoSwipe from data for {InstanceId} with {ItemCount} items after {Duration}ms: {Error}", 
                instanceId, itemList.Count, duration.TotalMilliseconds, ex.Message);
            throw;
        }
    }

    public async Task OpenGalleryAsync(string instanceId, int index = 0)
    {
        if (string.IsNullOrEmpty(instanceId))
        {
            var error = "InstanceId cannot be null or empty";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentException(error, nameof(instanceId));
        }
        
        if (index < 0)
        {
            var error = $"Index cannot be negative: {index}";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentException(error, nameof(index));
        }
        
        try
        {
            _logger?.LogInformation("🎯 Opening PhotoSwipe gallery {InstanceId} at index {Index}", instanceId, index);
            
            // Wait for PhotoSwipe to be ready
            await EnsurePhotoSwipeReadyAsync();
            
            // Use simple wrapper open method
            await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeBlazor.open", instanceId, index);
            
            _logger?.LogDebug("✅ Gallery opened successfully");
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "❌ Error opening PhotoSwipe gallery {InstanceId} at index {Index}: {Error}", instanceId, index, ex.Message);
            throw;
        }
    }

    public async Task DestroyAsync(string elementId)
    {
        if (string.IsNullOrEmpty(elementId))
        {
            _logger?.LogWarning("⚠️ Attempted to destroy PhotoSwipe instance with null or empty elementId");
            return;
        }
        
        var startTime = DateTimeOffset.Now;
        
        try
        {
            _logger?.LogInformation("🗑️ Destroying PhotoSwipe instance for element {ElementId}", elementId);
            
            // Use simple wrapper destroy method
            await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeBlazor.destroy", elementId);
            
            // Clean up event handlers for this instance
            var keysToRemove = _eventHandlers.Keys.Where(k => k.StartsWith($"{elementId}-")).ToList();
            foreach (var key in keysToRemove)
            {
                _eventHandlers.Remove(key);
            }
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe instance {ElementId} destroyed successfully in {Duration}ms (removed {HandlerCount} event handlers)", 
                elementId, duration.TotalMilliseconds, keysToRemove.Count);
        }
        catch (JSDisconnectedException)
        {
            // This is expected when the circuit is being disposed - not an error
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogDebug("🔌 PhotoSwipe instance {ElementId} cleanup skipped due to circuit disconnection after {Duration}ms", 
                elementId, duration.TotalMilliseconds);
            
            // Still clean up local event handlers
            var keysToRemove = _eventHandlers.Keys.Where(k => k.StartsWith($"{elementId}-")).ToList();
            foreach (var key in keysToRemove)
            {
                _eventHandlers.Remove(key);
            }
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error destroying PhotoSwipe instance {ElementId} after {Duration}ms: {Error}", 
                elementId, duration.TotalMilliseconds, ex.Message);
            throw;
        }
    }

    public async Task UpdateOptionsAsync(string instanceId, PhotoSwipeOptions options)
    {
        await EnsurePhotoSwipeReadyAsync();
        // Options can't be updated on existing instance with simple wrapper
        _logger?.LogWarning("⚠️ UpdateOptions not supported in simplified wrapper. Recreate instance instead.");
        await Task.CompletedTask;
    }

    public async Task RefreshGalleryAsync(string instanceId)
    {
        if (string.IsNullOrEmpty(instanceId))
        {
            var error = "InstanceId cannot be null or empty";
            _logger?.LogError("❌ {Error}", error);
            throw new ArgumentException(error, nameof(instanceId));
        }
        
        var startTime = DateTimeOffset.Now;
        
        try
        {
            _logger?.LogInformation("🔄 Refreshing PhotoSwipe gallery {InstanceId}", instanceId);
            
            await EnsurePhotoSwipeReadyAsync();
            // Simple wrapper doesn't support refresh - would need to recreate instance
            _logger?.LogWarning("⚠️ RefreshGallery not supported in simplified wrapper. Recreate instance instead.");
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe gallery {InstanceId} refresh requested in {Duration}ms", instanceId, duration.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error refreshing PhotoSwipe gallery {InstanceId} after {Duration}ms: {Error}", 
                instanceId, duration.TotalMilliseconds, ex.Message);
            throw;
        }
    }

    public async Task AddEventHandlerAsync(string instanceId, string eventName, EventCallback<PhotoSwipeEventArgs> eventCallback)
    {
        await EnsurePhotoSwipeReadyAsync();
        var key = $"{instanceId}-{eventName}";
        _eventHandlers[key] = eventCallback;
        // Event handlers are set up directly in photoswipe-simple.js
    }

    public async Task RemoveEventHandlerAsync(string instanceId, string eventName)
    {
        await EnsurePhotoSwipeReadyAsync();
        var key = $"{instanceId}-{eventName}";
        
        if (_eventHandlers.ContainsKey(key))
        {
            _eventHandlers.Remove(key);
            // Event handlers are managed directly in photoswipe-simple.js
        }
    }

    public async Task CreateImageElementAsync(string containerId, PhotoSwipeItem item)
    {
        await EnsurePhotoSwipeReadyAsync();
        // This method is not needed with our simple wrapper approach
        await Task.CompletedTask;
    }

    [JSInvokable]
    public async Task OnOpen(PhotoSwipeEvent eventData)
    {
        _logger?.LogDebug("📸 PhotoSwipe OnOpen event received");
        
        var matchingHandler = _eventHandlers.FirstOrDefault(kvp => 
            kvp.Key.EndsWith("-openPswp"));
        
        if (matchingHandler.Key != null)
        {
            var args = new PhotoSwipeEventArgs(eventData);
            await matchingHandler.Value.InvokeAsync(args);
        }
    }

    [JSInvokable]
    public async Task OnClose(PhotoSwipeEvent eventData)
    {
        _logger?.LogDebug("🔒 PhotoSwipe OnClose event received");
        
        var matchingHandler = _eventHandlers.FirstOrDefault(kvp => 
            kvp.Key.EndsWith("-closePswp"));
        
        if (matchingHandler.Key != null)
        {
            var args = new PhotoSwipeEventArgs(eventData);
            await matchingHandler.Value.InvokeAsync(args);
        }
    }

    [JSInvokable]
    public async Task OnChange(PhotoSwipeEvent eventData)
    {
        _logger?.LogDebug("🔄 PhotoSwipe OnChange event received with index {Index}", eventData.Index);
        
        var matchingHandler = _eventHandlers.FirstOrDefault(kvp => 
            kvp.Key.EndsWith("-change"));
        
        if (matchingHandler.Key != null)
        {
            var args = new PhotoSwipeEventArgs(eventData);
            await matchingHandler.Value.InvokeAsync(args);
        }
    }

    public ValueTask DisposeAsync()
    {
        try
        {
            _logger?.LogDebug("🗑️ Disposing PhotoSwipeInterop (simple wrapper approach)");
            
            // No module to dispose since we're using global PhotoSwipeBlazor
            // Clean up .NET references only
        }
        catch (Exception ex)
        {
            // Log unexpected errors during disposal but don't throw
            _logger?.LogWarning(ex, "⚠️ Unexpected error during PhotoSwipeInterop disposal: {Error}", ex.Message);
        }
        finally
        {
            _dotNetReference?.Dispose();
            _eventHandlers.Clear();
            _logger?.LogDebug("✅ PhotoSwipeInterop disposed successfully (simple wrapper approach)");
        }
        
        return ValueTask.CompletedTask;
    }
}