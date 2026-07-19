"use client";

import { useCallback, useEffect, useState } from "react";
import { CHAT_EVENT, getUnreadConversationCount } from "@/utils/chat";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  NOTIFICATION_EVENT,
  getUnreadMessageNotificationsCount
} from "@/lib/data/notifications";
import { createClient } from "@/utils/supabase/client";

export function useUnreadChatCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const syncUnreadCount = useCallback(async () => {
    const localUnreadCount = getUnreadConversationCount();

    if (!hasSupabaseBrowserEnv()) {
      setUnreadCount(localUnreadCount);
      return;
    }

    const user = await getCurrentUser();
    if (!user) {
      setUnreadCount(localUnreadCount);
      return;
    }

    const supabase = createClient();
    const remoteUnreadCount = await getUnreadMessageNotificationsCount(supabase, user.id);
    setUnreadCount(localUnreadCount + remoteUnreadCount);
  }, []);

  useEffect(() => {
    void syncUnreadCount();
    window.addEventListener(CHAT_EVENT, syncUnreadCount);
    window.addEventListener(NOTIFICATION_EVENT, syncUnreadCount);
    window.addEventListener("storage", syncUnreadCount);

    return () => {
      window.removeEventListener(CHAT_EVENT, syncUnreadCount);
      window.removeEventListener(NOTIFICATION_EVENT, syncUnreadCount);
      window.removeEventListener("storage", syncUnreadCount);
    };
  }, [syncUnreadCount]);

  useEffect(() => {
    let mounted = true;

    async function subscribeToMessageNotifications() {
      if (!hasSupabaseBrowserEnv()) {
        return undefined;
      }

      const user = await getCurrentUser();
      if (!user || !mounted) {
        return undefined;
      }

      const supabase = createClient();
      const channelId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const channel = supabase
        .channel(`chat-unread:${user.id}:${channelId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`
          },
          () => {
            void syncUnreadCount();
          }
        )
        .subscribe();

      return channel;
    }

    let subscription: Awaited<ReturnType<typeof subscribeToMessageNotifications>>;
    void subscribeToMessageNotifications().then((channel) => {
      subscription = channel;
    });

    return () => {
      mounted = false;
      if (subscription) {
        void createClient().removeChannel(subscription);
      }
    };
  }, [syncUnreadCount]);

  return unreadCount;
}
