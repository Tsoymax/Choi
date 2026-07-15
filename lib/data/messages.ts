import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message } from "@/utils/chat";

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

export async function getMessagesByConversationId(
  supabase: SupabaseClient,
  conversationId: string
) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []) as MessageRow[];
}

export async function sendMessage(
  supabase: SupabaseClient,
  conversationId: string,
  senderId: string,
  text: string
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

export async function markMessagesRead(
  supabase: SupabaseClient,
  conversationId: string,
  currentUserId: string
) {
  return supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId)
    .eq("read", false);
}
