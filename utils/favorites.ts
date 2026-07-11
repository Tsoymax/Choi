export const FAVORITES_KEY = "choi_favorites";
export const FAVORITES_EVENT = "choi:favorites-changed";

function notifyFavoritesChanged() {
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function getFavoriteIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawFavorites = window.localStorage.getItem(FAVORITES_KEY);
    if (!rawFavorites) {
      return [];
    }

    const favorites = JSON.parse(rawFavorites);
    return Array.isArray(favorites)
      ? favorites.filter((favorite): favorite is string => typeof favorite === "string")
      : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string) {
  return getFavoriteIds().includes(id);
}

export function addFavorite(id: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const favoriteIds = getFavoriteIds();
  const nextFavoriteIds = favoriteIds.includes(id)
    ? favoriteIds
    : [id, ...favoriteIds];

  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavoriteIds));
  notifyFavoritesChanged();
  return nextFavoriteIds;
}

export function removeFavorite(id: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const nextFavoriteIds = getFavoriteIds().filter((favoriteId) => favoriteId !== id);
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavoriteIds));
  notifyFavoritesChanged();
  return nextFavoriteIds;
}

export function toggleFavorite(id: string) {
  return isFavorite(id) ? removeFavorite(id) : addFavorite(id);
}
