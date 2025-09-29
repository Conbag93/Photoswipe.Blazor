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

    #region Favorite Functionality

    private const string FavoriteKey = "isFavorite";
    private const string FavoriteOrderKey = "favoriteOrder";

    /// <summary>
    /// Gets the favorite status of the item
    /// </summary>
    /// <param name="item">The PhotoSwipe item</param>
    /// <returns>True if the item is marked as favorite</returns>
    public static bool GetFavoriteStatus(this PhotoSwipeItem item)
    {
        var dataDict = GetDataDictionary(item);
        if (dataDict?.TryGetValue(FavoriteKey, out var value) == true)
        {
            return value is bool boolValue && boolValue;
        }
        return false;
    }

    /// <summary>
    /// Sets the favorite status of the item
    /// </summary>
    /// <param name="item">The PhotoSwipe item</param>
    /// <param name="isFavorite">True to mark as favorite, false to unfavorite</param>
    /// <param name="favoriteOrder">Optional order for favorite items (lower numbers first)</param>
    public static void SetFavoriteStatus(this PhotoSwipeItem item, bool isFavorite, int? favoriteOrder = null)
    {
        var dataDict = EnsureDataDictionary(item);
        dataDict[FavoriteKey] = isFavorite;

        if (isFavorite && favoriteOrder.HasValue)
        {
            dataDict[FavoriteOrderKey] = favoriteOrder.Value;
        }
        else if (!isFavorite && dataDict.ContainsKey(FavoriteOrderKey))
        {
            dataDict.Remove(FavoriteOrderKey);
        }
    }

    /// <summary>
    /// Gets the favorite order of the item (used for sorting favorites)
    /// </summary>
    /// <param name="item">The PhotoSwipe item</param>
    /// <returns>The favorite order, or null if not set</returns>
    public static int? GetFavoriteOrder(this PhotoSwipeItem item)
    {
        var dataDict = GetDataDictionary(item);
        if (dataDict?.TryGetValue(FavoriteOrderKey, out var value) == true)
        {
            return value is int intValue ? intValue : null;
        }
        return null;
    }

    /// <summary>
    /// Gets the Data property as a Dictionary if possible, or null if it's not a dictionary
    /// </summary>
    private static Dictionary<string, object>? GetDataDictionary(PhotoSwipeItem item)
    {
        return item.Data as Dictionary<string, object>;
    }

    /// <summary>
    /// Ensures the Data property is a Dictionary and returns it
    /// </summary>
    private static Dictionary<string, object> EnsureDataDictionary(PhotoSwipeItem item)
    {
        if (item.Data is not Dictionary<string, object> dataDict)
        {
            dataDict = new Dictionary<string, object>();
            item.Data = dataDict;
        }
        return dataDict;
    }

    /// <summary>
    /// Gets the filled star icon for favorite items
    /// </summary>
    /// <returns>SVG markup for filled star</returns>
    public static string GetFilledStarIcon()
    {
        return @"<svg width=""20"" height=""20"" viewBox=""0 0 24 24"" fill=""currentColor"" xmlns=""http://www.w3.org/2000/svg"">
                   <path d=""M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z""/>
                 </svg>";
    }

    /// <summary>
    /// Gets the empty star icon for non-favorite items
    /// </summary>
    /// <returns>SVG markup for empty star</returns>
    public static string GetEmptyStarIcon()
    {
        return @"<svg width=""20"" height=""20"" viewBox=""0 0 24 24"" fill=""none"" stroke=""currentColor"" stroke-width=""2"" xmlns=""http://www.w3.org/2000/svg"">
                   <path d=""M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z""/>
                 </svg>";
    }

    /// <summary>
    /// Orders a collection of PhotoSwipe items with favorites first
    /// </summary>
    /// <param name="items">The items to order</param>
    /// <returns>Items ordered with favorites first, then by favorite order, then by title</returns>
    public static IEnumerable<PhotoSwipeItem> OrderByFavorites(this IEnumerable<PhotoSwipeItem> items)
    {
        return items.OrderByDescending(x => x.GetFavoriteStatus())
                   .ThenBy(x => x.GetFavoriteOrder() ?? int.MaxValue)
                   .ThenBy(x => x.Title ?? x.Alt ?? "");
    }

    #endregion
}