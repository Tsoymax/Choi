import type { SupabaseClient } from "@supabase/supabase-js";

export const NOTIFICATION_EVENT = "choi:notifications-db-changed";

export type NotificationType =
  | "message"
  | "deal_confirmation"
  | "deal_confirmed"
  | "deal_cancelled"
  | "trust_level"
  | "offer_received"
  | "offer_accepted"
  | "offer_declined"
  | "listing_reserved"
  | "review_received"
  | "system";

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  listing_id: string | null;
  deal_id: string | null;
  conversation_id: string | null;
  is_read: boolean;
  created_at: string;
};

function logNotificationDebug(scope: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info(`[Choi notifications:${scope}]`, payload);
}

export function emitNotificationChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_EVENT));
  }
}

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id,user_id,type,title,body,listing_id,deal_id,conversation_id,is_read,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logNotificationDebug("select_error", {
      userId,
      errorCode: error.code,
      errorMessage: error.message
    });
    return [];
  }

  logNotificationDebug("select", {
    userId,
    count: data?.length ?? 0
  });

  return (data ?? []) as NotificationRow[];
}

export async function getUnreadNotificationsCount(
  supabase: SupabaseClient,
  userId: string
) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    logNotificationDebug("unread_count_error", {
      userId,
      errorCode: error.code,
      errorMessage: error.message
    });
    return 0;
  }

  return count ?? 0;
}

export async function getUnreadMessageNotificationsCount(
  supabase: SupabaseClient,
  userId: string
) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "message")
    .eq("is_read", false);

  if (error) {
    logNotificationDebug("message_unread_count_error", {
      userId,
      errorCode: error.code,
      errorMessage: error.message
    });
    return 0;
  }

  return count ?? 0;
}

export async function markConversationMessageNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string
) {
  const result = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("type", "message")
    .eq("conversation_id", conversationId)
    .eq("is_read", false);

  emitNotificationChanged();
  return result;
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  id: string
) {
  const result = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  emitNotificationChanged();
  return result;
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string
) {
  const result = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  emitNotificationChanged();
  return result;
}
