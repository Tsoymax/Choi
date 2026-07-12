import type { SupabaseClient } from "@supabase/supabase-js";

export async function getFavoriteListingIds(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId);

  if (error) {
    return [];
  }

  return data.map((favorite) => favorite.listing_id as string);
}

export async function addFavorite(supabase: SupabaseClient, userId: string, listingId: string) {
  return supabase.from("favorites").upsert({
    user_id: userId,
    listing_id: listingId
  });
}

export async function removeFavorite(supabase: SupabaseClient, userId: string, listingId: string) {
  return supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);
}
