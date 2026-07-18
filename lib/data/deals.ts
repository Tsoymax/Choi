import type { SupabaseClient } from "@supabase/supabase-js";
import { mapListingRowToProduct, type ListingProduct, type ListingWithRelations } from "@/lib/data/listings";
import type { ProfileRow } from "@/lib/data/profiles";

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

export type DealHistoryItem = {
  deal: RemoteDealRow;
  listing: ListingProduct | null;
  seller: Pick<ProfileRow, "id" | "name" | "district"> | null;
  buyer: Pick<ProfileRow, "id" | "name" | "district"> | null;
  role: "seller" | "buyer";
};

export type ReservationStatus = "pending" | "accepted" | "declined" | "cancelled" | "expired";

export type ReservationRequestRow = {
  id: string;
  listing_id: string;
  conversation_id: string;
  buyer_id: string;
  seller_id: string;
  requested_by: string;
  status: ReservationStatus;
  requested_for: string;
  expires_at: string;
  note: string | null;
  created_at: string | null;
  responded_at: string | null;
};

export async function getPendingDealForConversation(
  supabase: SupabaseClient,
  listingId: string,
  buyerId?: string,
  sellerId?: string
) {
  return getDealForConversation(supabase, listingId, buyerId, sellerId, "pending");
}

export async function getConfirmedDealForConversation(
  supabase: SupabaseClient,
  listingId: string,
  buyerId?: string,
  sellerId?: string
) {
  return getDealForConversation(supabase, listingId, buyerId, sellerId, "confirmed");
}

export async function getLatestDealForConversation(
  supabase: SupabaseClient,
  listingId: string,
  buyerId?: string,
  sellerId?: string
) {
  return getDealForConversation(supabase, listingId, buyerId, sellerId);
}

export async function getDealForConversation(
  supabase: SupabaseClient,
  listingId: string,
  buyerId?: string,
  sellerId?: string,
  status?: RemoteDealStatus
) {
  if (!buyerId || !sellerId) {
    return null;
  }

  let query = supabase
    .from("deals")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as RemoteDealRow | null;
}

export async function getDealById(supabase: SupabaseClient, dealId: string) {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as RemoteDealRow | null;
}

export async function getDealHistoryForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<DealHistoryItem[]> {
  const { data: deals, error } = await supabase
    .from("deals")
    .select("*")
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .in("status", ["confirmed", "cancelled"])
    .order("created_at", { ascending: false });

  if (error || !deals?.length) {
    return [];
  }

  const typedDeals = deals as RemoteDealRow[];
  const listingIds = Array.from(new Set(typedDeals.map((deal) => deal.listing_id)));
  const profileIds = Array.from(
    new Set(
      typedDeals
        .flatMap((deal) => [deal.seller_id, deal.buyer_id])
        .filter((id): id is string => Boolean(id))
    )
  );

  const [{ data: listings }, { data: profiles }] = await Promise.all([
    supabase
      .from("listings")
      .select("*, listing_images(*), listing_attributes(*), profiles!listings_user_id_fkey(name)")
      .in("id", listingIds),
    supabase
      .from("profiles")
      .select("id,name,district")
      .in("id", profileIds)
  ]);

  const listingById = new Map(
    ((listings ?? []) as ListingWithRelations[]).map((listing) => [
      listing.id,
      mapListingRowToProduct(listing)
    ])
  );
  const profileById = new Map(
    ((profiles ?? []) as Pick<ProfileRow, "id" | "name" | "district">[]).map((profile) => [
      profile.id,
      profile
    ])
  );

  return typedDeals.map((deal) => ({
    deal,
    listing: listingById.get(deal.listing_id) ?? null,
    seller: profileById.get(deal.seller_id) ?? null,
    buyer: deal.buyer_id ? profileById.get(deal.buyer_id) ?? null : null,
    role: deal.seller_id === userId ? "seller" : "buyer"
  }));
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

export async function releaseExpiredReservations(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("release_expired_reservations");
  return { releasedCount: Number(data ?? 0), error };
}

export async function getLatestReservationForConversation(
  supabase: SupabaseClient,
  conversationId: string
) {
  const { data, error } = await supabase
    .from("reservation_requests")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as ReservationRequestRow | null;
}

export async function requestReservationFromConversation(
  supabase: SupabaseClient,
  conversationId: string,
  requestedFor: string,
  note = ""
) {
  const { data, error } = await supabase.rpc("request_reservation_from_conversation", {
    p_conversation_id: conversationId,
    p_requested_for: requestedFor,
    p_note: note
  });

  return { reservation: data as ReservationRequestRow | null, error };
}

export async function acceptReservationRequest(
  supabase: SupabaseClient,
  reservationId: string
) {
  const { data, error } = await supabase.rpc("accept_reservation_request", {
    p_request_id: reservationId
  });

  return { reservation: data as ReservationRequestRow | null, error };
}

export async function declineReservationRequest(
  supabase: SupabaseClient,
  reservationId: string
) {
  const { data, error } = await supabase.rpc("decline_reservation_request", {
    p_request_id: reservationId
  });

  return { reservation: data as ReservationRequestRow | null, error };
}

export async function reserveListingForBuyer(
  supabase: SupabaseClient,
  conversationId: string,
  requestedFor: string,
  note = ""
) {
  const { data, error } = await supabase.rpc("reserve_listing_for_buyer", {
    p_conversation_id: conversationId,
    p_requested_for: requestedFor,
    p_note: note
  });

  return { reservation: data as ReservationRequestRow | null, error };
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
