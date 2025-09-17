using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace PhotoSwipe.Blazor;

/// <summary>
/// Provides render mode settings that can be configured for different hosting models.
/// This allows the PhotoSwipe RCL to work with Blazor Server, WebAssembly, and Hybrid apps.
/// </summary>
public static class InteractiveRenderSettings
{
    /// <summary>
    /// Interactive Server render mode. Set to null for non-web hosting models.
    /// </summary>
    public static IComponentRenderMode? InteractiveServer { get; set; } =
        RenderMode.InteractiveServer;

    /// <summary>
    /// Interactive Auto render mode. Set to null for non-web hosting models.
    /// </summary>
    public static IComponentRenderMode? InteractiveAuto { get; set; } =
        RenderMode.InteractiveAuto;

    /// <summary>
    /// Interactive WebAssembly render mode. Set to null for non-web hosting models.
    /// </summary>
    public static IComponentRenderMode? InteractiveWebAssembly { get; set; } =
        RenderMode.InteractiveWebAssembly;

    /// <summary>
    /// Configures render modes for MAUI Blazor Hybrid apps.
    /// Sets all render modes to null since MAUI apps are interactive by default.
    /// </summary>
    public static void ConfigureBlazorHybridRenderModes()
    {
        InteractiveServer = null;
        InteractiveAuto = null;
        InteractiveWebAssembly = null;
    }
}