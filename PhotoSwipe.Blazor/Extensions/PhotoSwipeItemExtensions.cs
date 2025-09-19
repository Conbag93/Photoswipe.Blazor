using PhotoSwipe.Blazor.Models;
using System.Text.Json;

namespace PhotoSwipe.Blazor.Extensions;

/// <summary>
/// Extension methods for PhotoSwipeItem to support placeholder identification and management
/// </summary>
public static class PhotoSwipeItemExtensions
{
    /// <summary>
    /// Determines if this PhotoSwipeItem represents a placeholder (not actual gallery content)
    /// </summary>
    public static bool IsPlaceholder(this PhotoSwipeItem item)
    {
        if (item.CustomData == null) return false;

        try
        {
            // Handle anonymous objects created by ToDisplayItem()
            if (item.CustomData.GetType().IsAnonymousType())
            {
                var json = JsonSerializer.Serialize(item.CustomData);
                var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
                return dict != null && dict.ContainsKey("IsPlaceholder") &&
                       dict["IsPlaceholder"].ToString()?.ToLowerInvariant() == "true";
            }

            // Handle direct property access
            var prop = item.CustomData.GetType().GetProperty("IsPlaceholder");
            if (prop != null && prop.GetValue(item.CustomData) is bool isPlaceholder)
            {
                return isPlaceholder;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Gets the placeholder type if this item is a placeholder, or null if it's not a placeholder
    /// </summary>
    public static PhotoSwipePlaceholderType? GetPlaceholderType(this PhotoSwipeItem item)
    {
        if (!item.IsPlaceholder()) return null;

        try
        {
            if (item.CustomData?.GetType().IsAnonymousType() == true)
            {
                var json = JsonSerializer.Serialize(item.CustomData);
                var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
                if (dict != null && dict.ContainsKey("PlaceholderType"))
                {
                    if (Enum.TryParse<PhotoSwipePlaceholderType>(dict["PlaceholderType"].ToString(), out var type))
                    {
                        return type;
                    }
                }
            }
            else if (item.CustomData != null)
            {
                var prop = item.CustomData.GetType().GetProperty("PlaceholderType");
                if (prop?.GetValue(item.CustomData) is PhotoSwipePlaceholderType type)
                {
                    return type;
                }
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Gets the placeholder ID if this item is a placeholder, or null if it's not a placeholder
    /// </summary>
    public static string? GetPlaceholderId(this PhotoSwipeItem item)
    {
        if (!item.IsPlaceholder()) return null;

        try
        {
            if (item.CustomData?.GetType().IsAnonymousType() == true)
            {
                var json = JsonSerializer.Serialize(item.CustomData);
                var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
                return dict?.ContainsKey("PlaceholderId") == true
                    ? dict["PlaceholderId"].ToString()
                    : null;
            }
            else if (item.CustomData != null)
            {
                var prop = item.CustomData.GetType().GetProperty("PlaceholderId");
                return prop?.GetValue(item.CustomData)?.ToString();
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Helper method to check if a type is an anonymous type
    /// </summary>
    private static bool IsAnonymousType(this Type type)
    {
        return type.Name.Contains("AnonymousType") &&
               type.IsGenericType &&
               type.Attributes.HasFlag(System.Reflection.TypeAttributes.NotPublic);
    }
}