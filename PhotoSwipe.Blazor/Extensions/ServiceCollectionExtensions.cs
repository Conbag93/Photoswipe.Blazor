using Microsoft.Extensions.DependencyInjection;
using PhotoSwipe.Blazor.Services;

namespace PhotoSwipe.Blazor.Extensions;

/// <summary>
/// Extension methods for configuring PhotoSwipe services in the DI container
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds PhotoSwipe services to the service collection.
    /// This method is compatible with all Blazor hosting models: Server, WebAssembly, and Hybrid.
    /// </summary>
    /// <param name="services">The service collection to add services to</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddPhotoSwipe(this IServiceCollection services)
    {
        services.AddScoped<PhotoSwipeInterop>();
        services.AddScoped<ImageProcessingService>();

        return services;
    }
}