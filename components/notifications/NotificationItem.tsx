"use client";

import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationRow } from "@/lib/data/notifications";
import { markNotificationRead } from "@/lib/data/notifications";
import {
  formatNotificationTime,
  getNotificationHref,
  getNotificationIcon
} from "./notificationUtils";

type NotificationItemProps = {
  notification: NotificationRow;
  supabase: SupabaseClient;
  onRead: () => void;
};

export function NotificationItem({
  notification,
  supabase,
  onRead
}: NotificationItemProps) {
  const router = useRouter();
  const Icon = getNotificationIcon(notification.type);

  async function openNotification() {
    if (!notification.is_read) {
      await markNotificationRead(supabase, notification.id);
      onRead();
    }

    const href = getNotificationHref(notification);
    if (href) {
      router.push(href as never);
    }
  }

  return (
    <button
      type="button"
      onClick={openNotification}
      className={`focus-ring grid w-full grid-cols-[48px_1fr] gap-4 rounded-[22px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
        notification.is_read
          ? "border-ink/8 bg-white"
          : "border-leaf/20 bg-[#f3f8f0]"
      }`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-leaf">
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <span className="flex items-start justify-between gap-3">
          <span className="font-semibold text-ink">{notification.title}</span>
          {!notification.is_read ? (
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-leaf" />
          ) : null}
        </span>
        {notification.body ? (
          <span className="mt-1 line-clamp-2 block text-sm leading-6 text-ink/62">
            {notification.body}
          </span>
        ) : null}
        <span className="mt-2 block text-xs font-semibold text-ink/42">
          {formatNotificationTime(notification.created_at)}
        </span>
      </span>
    </button>
  );
}
