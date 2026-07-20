export const FAVORITES_KEY = "choi_favorites";
export const FAVORITES_EVENT = "choi:favorites-changed";

type FavoriteRemoteApi = {
  userId: string;
  getIds: () => Promise<string[]>;
  add: (listingId: string) => Promise<void>;
  remove: (listingId: string) => Promise<void>;
};

const REMOTE_FAVORITES_CACHE_TTL_MS = 30_000;

let remoteFavoriteIdsCache: {
  userId: string;
  ids: string[];
  cachedAt: number;
} | null = null;
let remoteFavoriteIdsRequest: Promise<string[]> | null = null;

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

function notifyFavoritesChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }
}

function clearRemoteFavoriteIdsCache() {
  remoteFavoriteIdsCache = null;
  remoteFavoriteIdsRequest = null;
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
  clearRemoteFavoriteIdsCache();
  notifyFavoritesChanged();
  return nextFavoriteIds;
}

export function removeFavorite(id: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const nextFavoriteIds = getFavoriteIds().filter((favoriteId) => favoriteId !== id);
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavoriteIds));
  clearRemoteFavoriteIdsCache();
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

async function getRemoteFavoriteIds(remoteApi: FavoriteRemoteApi) {
  const now = Date.now();

  if (
    remoteFavoriteIdsCache?.userId === remoteApi.userId &&
    now - remoteFavoriteIdsCache.cachedAt < REMOTE_FAVORITES_CACHE_TTL_MS
  ) {
    return remoteFavoriteIdsCache.ids;
  }

  if (remoteFavoriteIdsRequest) {
    return remoteFavoriteIdsRequest;
  }

  remoteFavoriteIdsRequest = remoteApi
    .getIds()
    .then((ids) => {
      const nextIds = uniqueIds(ids);
      remoteFavoriteIdsCache = {
        userId: remoteApi.userId,
        ids: nextIds,
        cachedAt: Date.now()
      };
      return nextIds;
    })
    .finally(() => {
      remoteFavoriteIdsRequest = null;
    });

  return remoteFavoriteIdsRequest;
}

export async function getFavoriteIdsAsync() {
  const localIds = getFavoriteIds();
  const remoteApi = await getRemoteApi();

  if (!remoteApi) {
    return localIds;
  }

  try {
    const remoteIds = await getRemoteFavoriteIds(remoteApi);
    return uniqueIds([...remoteIds, ...localIds]);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Choi] favorites remote sync failed", error);
    }

    return localIds;
  }
}

export async function isFavoriteAsync(id: string) {
  return (await getFavoriteIdsAsync()).includes(id);
}

export async function toggleFavoriteAsync(id: string) {
  if (!isUuid(id)) {
    return toggleFavorite(id);
  }

  const localIds = getFavoriteIds();
  const remoteApi = await getRemoteApi();

  if (!remoteApi) {
    return toggleFavorite(id);
  }

  try {
    const remoteIds = await getRemoteFavoriteIds(remoteApi);
    const favoriteIds = uniqueIds([...remoteIds, ...localIds]);
    const favorite = favoriteIds.includes(id);

    if (favorite) {
      await remoteApi.remove(id);
    } else {
      await remoteApi.add(id);
    }

    const nextIds = favorite
      ? favoriteIds.filter((favoriteId) => favoriteId !== id)
      : uniqueIds([id, ...favoriteIds]);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextIds));
    }

    clearRemoteFavoriteIdsCache();
    notifyFavoritesChanged();
    return nextIds;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Choi] favorites toggle fallback", error);
    }

    return toggleFavorite(id);
  }
}
