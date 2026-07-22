"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  NOTIFICATION_EVENT,
  emitNotificationChanged,
  getUnreadNotificationsCount,
  type NotificationRow
} from "@/lib/data/notifications";
import { createClient } from "@/utils/supabase/client";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationToast } from "./NotificationToast";

const UNREAD_NOTIFICATION_CACHE_TTL_MS = 15_000;

let cachedUnreadNotifications: {
  userId: string;
  count: number;
  cachedAt: number;
} | null = null;
let unreadNotificationsRequest: Promise<number> | null = null;

export function NotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState<NotificationRow | null>(null);

  const syncCount = useCallback(async (force = false) => {
    if (!hasSupabaseBrowserEnv()) {
      setCount(0);
      return;
    }

    const user = await getCurrentUser();
    if (!user) {
      setCount(0);
      return;
    }

    if (
      !force &&
      cachedUnreadNotifications?.userId === user.id &&
      Date.now() - cachedUnreadNotifications.cachedAt < UNREAD_NOTIFICATION_CACHE_TTL_MS
    ) {
      setCount(cachedUnreadNotifications.count);
      return;
    }

    if (force) {
      cachedUnreadNotifications = null;
      unreadNotificationsRequest = null;
    }

    if (unreadNotificationsRequest) {
      setCount(await unreadNotificationsRequest);
      return;
    }

    const supabase = createClient();
    unreadNotificationsRequest = getUnreadNotificationsCount(supabase, user.id)
      .then((nextCount) => {
        cachedUnreadNotifications = {
          userId: user.id,
          count: nextCount,
          cachedAt: Date.now()
        };
        return nextCount;
      })
      .finally(() => {
        unreadNotificationsRequest = null;
      });

    setCount(await unreadNotificationsRequest);
  }, []);

  useEffect(() => {
    void syncCount();
    const handleNotificationChange = () => {
      void syncCount(true);
    };
    window.addEventListener(NOTIFICATION_EVENT, handleNotificationChange);

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handleNotificationChange);
    };
  }, [syncCount]);

  useEffect(() => {
    let mounted = true;

    async function subscribe() {
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
        .channel(`notifications:${user.id}:${channelId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`
          },
          (payload: { new: Record<string, unknown> }) => {
            const notification = payload.new as NotificationRow;
            if (notification.type === "review_received") {
              return;
            }

            if (process.env.NODE_ENV !== "production") {
              console.info("[Choi notifications:realtime_insert]", {
                id: notification.id,
                type: notification.type,
                userId: notification.user_id
              });
            }
            setToast(notification);
            void syncCount(true);
            emitNotificationChanged();
          }
        )
        .subscribe((status: string) => {
          if (process.env.NODE_ENV !== "production") {
            console.info("[Choi notifications:realtime_status]", { status });
          }
        });

      return channel;
    }

    let subscription: Awaited<ReturnType<typeof subscribe>>;
    void subscribe().then((channel) => {
      subscription = channel;
    });

    return () => {
      mounted = false;
      if (subscription) {
        void createClient().removeChannel(subscription);
      }
    };
  }, [syncCount]);

  return (
    <>
      <Link
        href="/notifications"
        className="focus-ring relative grid h-12 w-12 place-items-center rounded-full text-ink hover:bg-mist"
        aria-label="Уведомления"
      >
        <Bell size={24} />
        <NotificationBadge count={count} />
      </Link>
      <NotificationToast
        notification={toast}
        onClose={() => setToast(null)}
        onOpen={(href) => router.push(href as never)}
      />
    </>
  );
}
