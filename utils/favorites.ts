export const FAVORITES_KEY = "choi_favorites";
export const FAVORITES_EVENT = "choi:favorites-changed";

type FavoriteRemoteApi = {
  enabled: boolean;
  userId: string;
  getIds: () => Promise<string[]>;
  add: (listingId: string) => Promise<void>;
  remove: (listingId: string) => Promise<void>;
};

function notifyFavoritesChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }
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

async function getRemoteApi(): Promise<FavoriteRemoteApi | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const [{ hasSupabaseBrowserEnv, getCurrentUser }, { createClient }, remoteFavorites] =
    await Promise.all([
      import("@/lib/auth/client"),
      import("@/utils/supabase/client"),
      import("@/lib/data/favorites")
    ]);

  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = createClient();

  return {
    enabled: true,
    userId: user.id,
    getIds: () => remoteFavorites.getFavoriteListingIds(supabase, user.id),
    add: async (listingId: string) => {
      const { error } = await remoteFavorites.addFavorite(supabase, user.id, listingId);
      if (error) throw error;
    },
    remove: async (listingId: string) => {
      const { error } = await remoteFavorites.removeFavorite(supabase, user.id, listingId);
      if (error) throw error;
    }
  };
}

export async function getFavoriteIdsAsync() {
  const remoteApi = await getRemoteApi();

  if (!remoteApi) {
    return getFavoriteIds();
  }

  return remoteApi.getIds();
}

export async function isFavoriteAsync(id: string) {
  return (await getFavoriteIdsAsync()).includes(id);
}

export async function toggleFavoriteAsync(id: string) {
  const remoteApi = await getRemoteApi();

  if (!remoteApi) {
    return toggleFavorite(id);
  }

  const favoriteIds = await remoteApi.getIds();
  const favorite = favoriteIds.includes(id);

  if (favorite) {
    await remoteApi.remove(id);
  } else {
    await remoteApi.add(id);
  }

  const nextIds = favorite
    ? favoriteIds.filter((favoriteId) => favoriteId !== id)
    : [id, ...favoriteIds];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextIds));
  }

  notifyFavoritesChanged();
  return nextIds;
}
