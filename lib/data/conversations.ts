import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, Message } from "@/utils/chat";
import {
  mapListingRowToProduct,
  type ListingWithRelations
} from "@/lib/data/listings";

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  seller_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  listings?: ListingWithRelations | null;
  messages?: MessageRow[] | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  text: string;
  read: boolean | null;
  created_at: string | null;
};

export function mapMessageRow(row: MessageRow, currentUserId: string): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender_id === currentUserId ? "buyer" : "seller",
    text: row.text,
    createdAt: row.created_at ?? new Date().toISOString(),
    read: row.read ?? false
  };
}

export function mapConversationRow(
  row: ConversationRow,
  currentUserId: string
): Conversation {
  const listing = row.listings ? mapListingRowToProduct(row.listings) : undefined;
  const messages = [...(row.messages ?? [])].sort(
    (first, second) =>
      new Date(first.created_at ?? 0).getTime() -
      new Date(second.created_at ?? 0).getTime()
  );
  const lastMessage = messages.at(-1);

  return {
    id: row.id,
    listingId: row.listing_id,
    sellerId: row.seller_id ?? undefined,
    buyerId: row.buyer_id ?? undefined,
    sellerName: listing?.seller ?? "Choi",
    buyerName: "Вы",
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    listing,
    lastMessage: lastMessage ? mapMessageRow(lastMessage, currentUserId) : undefined,
    remote: true
  };
}

export async function getConversationsByUserId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, listings(*, listing_images(*), profiles!listings_user_id_fkey(name)), messages(*)")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    return [];
  }

  return ((data ?? []) as ConversationRow[]).map((conversation) =>
    mapConversationRow(conversation, userId)
  );
}

export async function getUnreadRemoteConversationCount(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, messages!inner(id)")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .eq("messages.read", false)
    .neq("messages.sender_id", userId);

  if (error) {
    return 0;
  }

  return new Set((data ?? []).map((conversation) => conversation.id)).size;
}

export async function getConversationById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, listings(*, listing_images(*), profiles!listings_user_id_fkey(name)), messages(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as ConversationRow | null;
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
