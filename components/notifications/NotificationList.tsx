"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationRow } from "@/lib/data/notifications";
import { getNotificationGroup } from "./notificationUtils";
import { NotificationItem } from "./NotificationItem";

type NotificationListProps = {
  notifications: NotificationRow[];
  supabase: SupabaseClient;
  onRead: () => void;
};

const groups = ["Сегодня", "Вчера", "Ранее"];

export function NotificationList({
  notifications,
  supabase,
  onRead
}: NotificationListProps) {
  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const items = notifications.filter(
          (notification) => getNotificationGroup(notification.created_at) === group
        );

        if (items.length === 0) {
          return null;
        }

        return (
          <section key={group}>
            <h2 className="mb-3 text-lg font-semibold text-ink">{group}</h2>
            <div className="space-y-3">
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  supabase={supabase}
                  onRead={onRead}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
