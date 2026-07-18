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
