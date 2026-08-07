import type { SupabaseClient } from "@supabase/supabase-js";

export type ListingEngagement = {
  viewsCount: number;
  likesCount: number;
};

type ListingEngagementRow = {
  listing_id: string;
  views_count: number | string | null;
  likes_count: number | string | null;
};

function toCount(value: number | string | null | undefined) {
  const count = Number(value ?? 0);
  return Number.isFinite(count) ? count : 0;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function getListingEngagementMetrics(
  supabase: SupabaseClient,
  listingIds: string[]
): Promise<Record<string, ListingEngagement>> {
  const ids = Array.from(new Set(listingIds.filter(isUuid)));

  if (ids.length === 0) {
    return {};
  }

  const { data, error } = await supabase.rpc("get_listing_engagement_metrics", {
    p_listing_ids: ids
  });

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[Choi listing engagement] metrics unavailable", error.message);
    }

    return Object.fromEntries(
      ids.map((id) => [id, { viewsCount: 0, likesCount: 0 }])
    );
  }

  return Object.fromEntries(
    ((data ?? []) as ListingEngagementRow[]).map((row) => [
      row.listing_id,
      {
        viewsCount: toCount(row.views_count),
        likesCount: toCount(row.likes_count)
      }
    ])
  );
}

export async function recordListingView(supabase: SupabaseClient, listingId: string) {
  if (!isUuid(listingId)) {
    return;
  }

  const { error } = await supabase.rpc("record_listing_view", {
    p_listing_id: listingId
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.info("[Choi listing engagement] view was not recorded", error.message);
  }
}
