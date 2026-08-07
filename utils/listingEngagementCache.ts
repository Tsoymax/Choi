export const LISTING_ENGAGEMENT_CACHE_KEY = "choi_listing_engagement_counts";
export const LISTING_VIEWED_CACHE_KEY = "choi_listing_viewed_ids";

type ListingEngagementCacheItem = {
  viewsCount?: number;
  likesCount?: number;
};

type ListingEngagementCache = Record<string, ListingEngagementCacheItem>;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function toCount(value: unknown) {
  const count = Number(value ?? 0);
  return Number.isFinite(count) ? Math.max(0, count) : 0;
}

function readCache(): ListingEngagementCache {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const rawCache = window.localStorage.getItem(LISTING_ENGAGEMENT_CACHE_KEY);
    const parsed = rawCache ? JSON.parse(rawCache) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache: ListingEngagementCache) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LISTING_ENGAGEMENT_CACHE_KEY, JSON.stringify(cache));
}

export function getCachedListingEngagement(listingId: string) {
  const cached = readCache()[listingId] ?? {};

  return {
    viewsCount: toCount(cached.viewsCount),
    likesCount: toCount(cached.likesCount)
  };
}

export function setCachedListingEngagement(
  listingId: string,
  engagement: ListingEngagementCacheItem
) {
  if (!listingId) {
    return;
  }

  const cache = readCache();
  const current = cache[listingId] ?? {};
  cache[listingId] = {
    viewsCount:
      engagement.viewsCount === undefined
        ? toCount(current.viewsCount)
        : toCount(engagement.viewsCount),
    likesCount:
      engagement.likesCount === undefined
        ? toCount(current.likesCount)
        : toCount(engagement.likesCount)
  };
  writeCache(cache);
}

export function withCachedListingEngagement<
  T extends { id: string; viewsCount?: number; likesCount?: number }
>(listing: T): T {
  const cached = getCachedListingEngagement(listing.id);

  return {
    ...listing,
    viewsCount: Math.max(toCount(listing.viewsCount), cached.viewsCount),
    likesCount: Math.max(toCount(listing.likesCount), cached.likesCount)
  };
}

export function setCachedListingLikes(listingId: string, likesCount: number) {
  setCachedListingEngagement(listingId, { likesCount });
}

export function markCachedListingViewed(listingId: string) {
  if (!canUseStorage() || !listingId) {
    return false;
  }

  try {
    const rawViewedIds = window.localStorage.getItem(LISTING_VIEWED_CACHE_KEY);
    const viewedIds = rawViewedIds ? JSON.parse(rawViewedIds) : [];
    const nextViewedIds = Array.isArray(viewedIds)
      ? viewedIds.filter((id): id is string => typeof id === "string")
      : [];

    if (nextViewedIds.includes(listingId)) {
      return false;
    }

    nextViewedIds.push(listingId);
    window.localStorage.setItem(LISTING_VIEWED_CACHE_KEY, JSON.stringify(nextViewedIds));

    const current = getCachedListingEngagement(listingId);
    setCachedListingEngagement(listingId, {
      viewsCount: current.viewsCount + 1,
      likesCount: current.likesCount
    });

    return true;
  } catch {
    return false;
  }
}
