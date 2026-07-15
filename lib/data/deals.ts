import type { SupabaseClient } from "@supabase/supabase-js";

export type RemoteDealStatus = "pending" | "confirmed" | "cancelled";

export type RemoteDealRow = {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string | null;
  status: RemoteDealStatus;
  created_at: string | null;
  confirmed_at: string | null;
};

export async function getPendingDealForConversation(
  supabase: SupabaseClient,
  listingId: string,
  buyerId?: string,
  sellerId?: string
) {
  if (!buyerId || !sellerId) {
    return null;
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as RemoteDealRow | null;
}

export async function reserveListingFromConversation(
  supabase: SupabaseClient,
  conversationId: string
) {
  const { data, error } = await supabase.rpc("reserve_listing_from_conversation", {
    p_conversation_id: conversationId
  });

  return { listing: data, error };
}

export async function createDealFromConversation(
  supabase: SupabaseClient,
  conversationId: string
) {
  const { data, error } = await supabase.rpc("create_deal_from_conversation", {
    p_conversation_id: conversationId
  });

  return { deal: data as RemoteDealRow | null, error };
}

export async function respondToDeal(
  supabase: SupabaseClient,
  dealId: string,
  confirmed: boolean
) {
  const { data, error } = await supabase.rpc("respond_to_deal", {
    p_deal_id: dealId,
    p_confirmed: confirmed
  });

  return { deal: data as RemoteDealRow | null, error };
}
