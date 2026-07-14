"use client";

import { useEffect } from "react";
import type { NotificationRow } from "@/lib/data/notifications";
import { getNotificationHref, getNotificationIcon } from "./notificationUtils";

type NotificationToastProps = {
  notification: NotificationRow | null;
  onClose: () => void;
  onOpen: (href: string) => void;
};

export function NotificationToast({
  notification,
  onClose,
  onOpen
}: NotificationToastProps) {
  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeoutId = setTimeout(onClose, 4600);
    return () => clearTimeout(timeoutId);
  }, [notification, onClose]);

  if (!notification) {
    return null;
  }

  const Icon = getNotificationIcon(notification.type);
  const href = getNotificationHref(notification);

  return (
    <button
      type="button"
      onClick={() => {
        if (href) {
          onOpen(href);
        }
        onClose();
      }}
      className="fixed right-4 top-28 z-[80] flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-[22px] border border-ink/10 bg-white p-4 text-left shadow-[0_20px_70px_rgba(24,32,29,0.18)] transition hover:-translate-y-0.5 md:right-6"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mist text-leaf">
        <Icon size={21} />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{notification.title}</span>
        {notification.body ? (
          <span className="mt-1 line-clamp-2 block text-sm text-ink/62">
            {notification.body}
          </span>
        ) : null}
      </span>
    </button>
  );
}
