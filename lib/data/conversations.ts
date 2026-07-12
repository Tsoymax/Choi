import type { SupabaseClient } from "@supabase/supabase-js";

export async function getConversationsByUserId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, listings(*), messages(*)")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return data;
}

export async function getConversationById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, listings(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export async function createConversation(
  supabase: SupabaseClient,
  listingId: string,
  buyerId: string,
  sellerId: string
) {
  const { data, error } = await supabase
    .from("conversations")
    .upsert(
      {
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId
      },
      { onConflict: "listing_id,buyer_id,seller_id" }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
