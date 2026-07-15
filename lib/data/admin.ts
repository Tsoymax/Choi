import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListingRow } from "@/lib/data/listings";
import type { ProfileRow } from "@/lib/data/profiles";
import type { ReportRow, ReportStatus } from "@/lib/data/reports";
import { getReports } from "@/lib/data/reports";
import { getAdminReviews, type AdminReviewRow } from "@/lib/data/reviews";

export type AdminListingRow = ListingRow & {
  listing_images?: {
    id: string;
    image_url: string;
    position: number | null;
    is_primary: boolean | null;
  }[] | null;
};

export type AdminData = {
  reports: ReportRow[];
  listings: AdminListingRow[];
  profiles: ProfileRow[];
  reviews: AdminReviewRow[];
};

export async function getAdminReports(
  supabase: SupabaseClient,
  status?: ReportStatus | "all"
) {
  return getReports(supabase, status);
}

export async function getAdminListings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id,user_id,category,title,description,price,currency,negotiable,district,latitude,longitude,phone,status,created_at,updated_at,listing_images(id,image_url,position,is_primary)"
    )
    .order("created_at", { ascending: false });

  return { listings: (data ?? []) as AdminListingRow[], error };
}

export async function getAdminProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return { profiles: (data ?? []) as ProfileRow[], error };
}

export async function getAdminData(supabase: SupabaseClient): Promise<AdminData> {
  const [reportsResult, listingsResult, profilesResult] = await Promise.all([
    getAdminReports(supabase, "all"),
    getAdminListings(supabase),
    getAdminProfiles(supabase)
  ]);

  const reviewsResult = await getAdminReviews(supabase);

  if (reportsResult.error) {
    console.error("[Choi admin] reports load failed", reportsResult.error);
  }

  if (listingsResult.error) {
    console.error("[Choi admin] listings load failed", listingsResult.error);
  }

  if (profilesResult.error) {
    console.error("[Choi admin] profiles load failed", profilesResult.error);
  }

  if (reviewsResult.error) {
    console.error("[Choi admin] reviews load failed", reviewsResult.error);
  }

  return {
    reports: reportsResult.reports,
    listings: listingsResult.listings,
    profiles: profilesResult.profiles,
    reviews: reviewsResult.reviews
  };
}
