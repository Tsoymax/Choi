import type { SupabaseClient } from "@supabase/supabase-js";

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

  return data;
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

  return data;
}
