"use client";

import { useCallback, useEffect, useState } from "react";
import { CHAT_EVENT, getUnreadConversationCount } from "@/utils/chat";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  NOTIFICATION_EVENT,
  getUnreadMessageNotificationsCount
} from "@/lib/data/notifications";
import { createClient } from "@/utils/supabase/client";

const UNREAD_COUNT_CACHE_TTL_MS = 2_000;

let cachedUnreadCount = 0;
let cachedAt = 0;
let unreadCountRequest: Promise<number> | null = null;

async function getUnreadChatCountSnapshot() {
  const localUnreadCount = getUnreadConversationCount();

  if (!hasSupabaseBrowserEnv()) {
    cachedUnreadCount = localUnreadCount;
    cachedAt = Date.now();
    return cachedUnreadCount;
  }

  const now = Date.now();
  if (now - cachedAt < UNREAD_COUNT_CACHE_TTL_MS) {
    return cachedUnreadCount;
  }

  if (unreadCountRequest) {
    return unreadCountRequest;
  }

  unreadCountRequest = (async () => {
    const user = await getCurrentUser();
    if (!user) {
      return localUnreadCount;
    }

    const supabase = createClient();
    const remoteUnreadCount = await getUnreadMessageNotificationsCount(supabase, user.id);
    return localUnreadCount + remoteUnreadCount;
  })()
    .then((count) => {
      cachedUnreadCount = count;
      cachedAt = Date.now();
      return count;
    })
    .finally(() => {
      unreadCountRequest = null;
    });

  return unreadCountRequest;
}

export function useUnreadChatCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const syncUnreadCount = useCallback(async (force = false) => {
    if (force) {
      cachedAt = 0;
    }

    setUnreadCount(await getUnreadChatCountSnapshot());
  }, []);

  useEffect(() => {
    void syncUnreadCount();
    const forceSync = () => {
      void syncUnreadCount(true);
    };
    window.addEventListener(CHAT_EVENT, forceSync);
    window.addEventListener(NOTIFICATION_EVENT, forceSync);
    window.addEventListener("storage", forceSync);

    return () => {
      window.removeEventListener(CHAT_EVENT, forceSync);
      window.removeEventListener(NOTIFICATION_EVENT, forceSync);
      window.removeEventListener("storage", forceSync);
    };
  }, [syncUnreadCount]);

  return unreadCount;
}
