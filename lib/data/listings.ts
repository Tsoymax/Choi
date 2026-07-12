import type { SupabaseClient } from "@supabase/supabase-js";

export type ListingRow = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  negotiable: boolean | null;
  district: string;
  phone: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListingImageRow = {
  id: string;
  listing_id: string;
  image_url: string;
  position: number | null;
  is_primary: boolean | null;
  created_at: string | null;
};

export async function getActiveListings(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

export async function getListingsByUserId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

export async function getListingById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(*), profiles(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}
