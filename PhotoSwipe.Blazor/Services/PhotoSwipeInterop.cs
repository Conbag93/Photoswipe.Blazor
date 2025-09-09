using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Microsoft.Extensions.Logging;
using PhotoSwipe.Blazor.Models;
using System.Text.Json;

namespace PhotoSwipe.Blazor.Services;

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
    /// Ensures PhotoSwipe is ready in the main page context before attempting to use it
    /// </summary>
    private async Task EnsurePhotoSwipeReadyAsync()
    {
        var maxAttempts = 50; // 5 seconds max wait
        var attempt = 0;
        
        while (attempt < maxAttempts)
        {
            try
            {
                var isReady = await _jsRuntime.InvokeAsync<bool>("eval", "typeof window.PhotoSwipeManager !== 'undefined' && window.photoSwipeReady === true");
                if (isReady)
                {
                    _logger?.LogDebug("✅ PhotoSwipe ready in main page context (attempt {Attempt})", attempt + 1);
                    return;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogDebug("⏳ PhotoSwipe not ready yet (attempt {Attempt}): {Error}", attempt + 1, ex.Message);
            }
            
            attempt++;
            await Task.Delay(100); // Wait 100ms between attempts
        }
        
        var error = "PhotoSwipe not ready in main page context after maximum wait time. Ensure JavaScript initializers are properly configured.";
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
            _logger?.LogInformation("🚀 Initializing PhotoSwipe lightbox using MAIN PAGE CONTEXT for element {ElementId}", elementId);
            
            // Wait for PhotoSwipe to be ready in main page context
            await EnsurePhotoSwipeReadyAsync();
            
            _logger?.LogDebug("⚙️ Initializing lightbox with options: {Options}", options?.ToString() ?? "null");
            
            // Call PhotoSwipeManager in main page context instead of isolated module
            var instanceId = await _jsRuntime.InvokeAsync<string>(
                "window.PhotoSwipeManager.initializeLightbox", elementId, options);
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe lightbox initialized successfully in MAIN PAGE CONTEXT for element {ElementId}, instance: {InstanceId} in {Duration}ms", 
                elementId, instanceId, duration.TotalMilliseconds);
                
            return instanceId;
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
            _logger?.LogInformation("📊 Initializing PhotoSwipe gallery using MAIN PAGE CONTEXT for element {ElementId} with {ItemCount} items", elementId, itemList.Count);
            
            // Wait for PhotoSwipe to be ready in main page context
            await EnsurePhotoSwipeReadyAsync();
            
            // Call PhotoSwipeManager in main page context instead of isolated module
            var instanceId = await _jsRuntime.InvokeAsync<string>(
                "window.PhotoSwipeManager.initializeGallery", elementId, itemList, options);
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe gallery initialized successfully in MAIN PAGE CONTEXT for element {ElementId}, instance: {InstanceId} with {ItemCount} items in {Duration}ms", 
                elementId, instanceId, itemList.Count, duration.TotalMilliseconds);
                
            return instanceId;
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error initializing PhotoSwipe gallery for element {ElementId} with {ItemCount} items after {Duration}ms: {Error}", 
                elementId, itemList.Count, duration.TotalMilliseconds, ex.Message);
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
            _logger?.LogInformation("🎯 Opening PhotoSwipe gallery {InstanceId} at index {Index} using MAIN PAGE CONTEXT", instanceId, index);
            
            // Wait for PhotoSwipe to be ready in main page context
            await EnsurePhotoSwipeReadyAsync();
            
            // Call PhotoSwipeManager in main page context
            await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeManager.openLightbox", instanceId, index);
            
            _logger?.LogDebug("✅ Gallery opened successfully in MAIN PAGE CONTEXT");
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "❌ Error opening PhotoSwipe gallery {InstanceId} at index {Index}: {Error}", instanceId, index, ex.Message);
            throw;
        }
    }

    public async Task DestroyAsync(string instanceId)
    {
        if (string.IsNullOrEmpty(instanceId))
        {
            _logger?.LogWarning("⚠️ Attempted to destroy PhotoSwipe instance with null or empty instanceId");
            return;
        }
        
        var startTime = DateTimeOffset.Now;
        
        try
        {
            _logger?.LogInformation("🗑️ Destroying PhotoSwipe instance {InstanceId} using MAIN PAGE CONTEXT", instanceId);
            
            // Call PhotoSwipeManager in main page context (no need to wait for ready during destruction)
            await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeManager.destroy", instanceId);
            
            // Clean up event handlers for this instance
            var keysToRemove = _eventHandlers.Keys.Where(k => k.StartsWith($"{instanceId}-")).ToList();
            foreach (var key in keysToRemove)
            {
                _eventHandlers.Remove(key);
            }
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe instance {InstanceId} destroyed successfully in MAIN PAGE CONTEXT in {Duration}ms (removed {HandlerCount} event handlers)", 
                instanceId, duration.TotalMilliseconds, keysToRemove.Count);
        }
        catch (JSDisconnectedException)
        {
            // This is expected when the circuit is being disposed - not an error
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogDebug("🔌 PhotoSwipe instance {InstanceId} cleanup skipped due to circuit disconnection after {Duration}ms", 
                instanceId, duration.TotalMilliseconds);
            
            // Still clean up local event handlers
            var keysToRemove = _eventHandlers.Keys.Where(k => k.StartsWith($"{instanceId}-")).ToList();
            foreach (var key in keysToRemove)
            {
                _eventHandlers.Remove(key);
            }
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error destroying PhotoSwipe instance {InstanceId} after {Duration}ms: {Error}", 
                instanceId, duration.TotalMilliseconds, ex.Message);
            throw;
        }
    }

    public async Task UpdateOptionsAsync(string instanceId, PhotoSwipeOptions options)
    {
        await EnsurePhotoSwipeReadyAsync();
        await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeManager.updateOptions", instanceId, options);
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
            _logger?.LogInformation("🔄 Refreshing PhotoSwipe gallery {InstanceId} using MAIN PAGE CONTEXT", instanceId);
            
            await EnsurePhotoSwipeReadyAsync();
            await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeManager.refreshGallery", instanceId);
            
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogInformation("✅ PhotoSwipe gallery {InstanceId} refreshed successfully in MAIN PAGE CONTEXT in {Duration}ms", instanceId, duration.TotalMilliseconds);
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
        
        await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeManager.addEventHandler", instanceId, eventName, _dotNetReference, nameof(HandleEvent));
    }

    public async Task RemoveEventHandlerAsync(string instanceId, string eventName)
    {
        await EnsurePhotoSwipeReadyAsync();
        var key = $"{instanceId}-{eventName}";
        
        if (_eventHandlers.ContainsKey(key))
        {
            _eventHandlers.Remove(key);
            await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeManager.removeEventHandler", instanceId, eventName, nameof(HandleEvent));
        }
    }

    public async Task CreateImageElementAsync(string containerId, PhotoSwipeItem item)
    {
        await EnsurePhotoSwipeReadyAsync();
        await _jsRuntime.InvokeVoidAsync("window.PhotoSwipeManager.createImageElement", containerId, item);
    }

    [JSInvokable]
    public async Task HandleEvent(PhotoSwipeEvent photoSwipeEvent)
    {
        if (photoSwipeEvent == null)
        {
            _logger?.LogWarning("⚠️ Received null PhotoSwipeEvent");
            return;
        }
        
        var startTime = DateTimeOffset.Now;
        
        try
        {
            _logger?.LogDebug("📡 Handling PhotoSwipe event {EventType} with index {Index}", photoSwipeEvent.Type, photoSwipeEvent.Index);
            
            // Find the appropriate event handler based on the event type
            var matchingHandler = _eventHandlers.FirstOrDefault(kvp => 
                kvp.Key.EndsWith($"-{photoSwipeEvent.Type}"));
            
            if (matchingHandler.Key != null)
            {
                var args = new PhotoSwipeEventArgs(photoSwipeEvent);
                await matchingHandler.Value.InvokeAsync(args);
                
                var duration = DateTimeOffset.Now - startTime;
                _logger?.LogDebug("✅ PhotoSwipe event {EventType} handled successfully in {Duration}ms", photoSwipeEvent.Type, duration.TotalMilliseconds);
            }
            else
            {
                _logger?.LogDebug("🤷 No handler found for PhotoSwipe event {EventType}", photoSwipeEvent.Type);
            }
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.Now - startTime;
            _logger?.LogError(ex, "❌ Error handling PhotoSwipe event {EventType} after {Duration}ms: {Error}", 
                photoSwipeEvent?.Type, duration.TotalMilliseconds, ex.Message);
        }
    }

    public ValueTask DisposeAsync()
    {
        try
        {
            _logger?.LogDebug("🗑️ Disposing PhotoSwipeInterop (MAIN PAGE CONTEXT approach)");
            
            // No module to dispose since we're using global PhotoSwipeManager
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
            _logger?.LogDebug("✅ PhotoSwipeInterop disposed successfully (MAIN PAGE CONTEXT approach)");
        }
        
        return ValueTask.CompletedTask;
    }
}