"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  DEALS_EVENT,
  NOTIFICATIONS_EVENT,
  getNotifications,
  markNotificationRead,
  respondToDeal,
  type ChoiNotification
} from "@/utils/deals";
import { CURRENT_USER_ID } from "@/utils/users";

export function DealNotificationModal() {
  const [notifications, setNotifications] = useState<ChoiNotification[]>([]);

  useEffect(() => {
    const syncNotifications = () => setNotifications(getNotifications());

    syncNotifications();
    window.addEventListener(NOTIFICATIONS_EVENT, syncNotifications);
    window.addEventListener(DEALS_EVENT, syncNotifications);
    window.addEventListener("storage", syncNotifications);

    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT, syncNotifications);
      window.removeEventListener(DEALS_EVENT, syncNotifications);
      window.removeEventListener("storage", syncNotifications);
    };
  }, []);

  const notification = useMemo(
    () =>
      notifications.find(
        (item) =>
          item.userId === CURRENT_USER_ID &&
          !item.isRead &&
          (item.type === "deal_confirmation" || item.type === "trust_level")
      ),
    [notifications]
  );

  function close() {
    if (!notification) return;
    markNotificationRead(notification.id);
  }

  function answerDeal(confirmed: boolean) {
    if (!notification) return;
    if (notification.dealId) {
      respondToDeal(notification.dealId, confirmed);
    }
    close();
  }

  if (!notification) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-ink/30 backdrop-blur-sm">
      <div className="absolute inset-x-4 top-1/2 mx-auto max-w-[440px] -translate-y-1/2 rounded-[28px] bg-white p-6 text-center shadow-[0_24px_80px_rgba(24,32,29,0.18)]">
        <Image src="/mascot.svg" alt="Choi" width={76} height={76} className="mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-ink">{notification.title}</h2>
        {notification.body ? (
          <p className="mt-2 text-base text-ink/62">{notification.body}</p>
        ) : null}

        {notification.type === "deal_confirmation" ? (
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => answerDeal(true)}
              className="focus-ring h-12 rounded-full bg-leaf px-5 text-sm font-semibold text-white shadow-lg shadow-leaf/20"
            >
              Да, всё получилось
            </button>
            <button
              type="button"
              onClick={() => answerDeal(false)}
              className="focus-ring h-12 rounded-full bg-mist px-5 text-sm font-semibold text-ink"
            >
              Нет
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={close}
            className="focus-ring mt-6 h-12 rounded-full bg-leaf px-6 text-sm font-semibold text-white shadow-lg shadow-leaf/20"
          >
            Спасибо
          </button>
        )}
      </div>
    </div>
  );
}
