"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChoiTeaLoader } from "@/components/ChoiTeaLoader";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationsEmptyState } from "@/components/notifications/NotificationsEmptyState";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  NOTIFICATION_EVENT,
  emitNotificationChanged,
  getNotifications,
  markAllNotificationsRead,
  type NotificationRow
} from "@/lib/data/notifications";
import { createClient } from "@/utils/supabase/client";

export default function NotificationsPage() {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(
    () => (hasSupabaseBrowserEnv() ? createClient() : null),
    []
  );

  useEffect(() => {
    let mounted = true;

    async function syncNotifications() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const user = await getCurrentUser();
      if (!mounted) {
        return;
      }

      if (!user) {
        setUserId("");
        setNotifications([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setNotifications(await getNotifications(supabase, user.id));
      setLoading(false);
    }

    void syncNotifications();
    window.addEventListener(NOTIFICATION_EVENT, syncNotifications);

    return () => {
      mounted = false;
      window.removeEventListener(NOTIFICATION_EVENT, syncNotifications);
    };
  }, [supabase]);

  async function readAll() {
    if (!userId || !supabase) {
      return;
    }

    await markAllNotificationsRead(supabase, userId);
    setNotifications(await getNotifications(supabase, userId));
    emitNotificationChanged();
  }

  const hasUnread = notifications.some((notification) => !notification.is_read);

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />

      <section className="mx-auto max-w-[920px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
              Уведомления
            </h1>
            <p className="mt-3 text-lg text-ink/62">Всё важное рядом</p>
          </div>
          {hasUnread ? (
            <button
              type="button"
              onClick={readAll}
              className="focus-ring h-12 rounded-full bg-leaf px-5 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
            >
              Прочитать всё
            </button>
          ) : null}
        </div>

        {loading ? <ChoiTeaLoader label="Загружаем уведомления" /> : null}

        {!userId && !loading ? (
          <section className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
            <h2 className="text-2xl font-semibold text-ink">Войдите в Choi</h2>
            <p className="mt-2 text-ink/62">Уведомления доступны после входа.</p>
            <Link
              href="/login?next=/notifications"
              className="focus-ring mt-6 inline-flex h-12 items-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
            >
              Войти
            </Link>
          </section>
        ) : null}

        {userId && supabase && notifications.length > 0 ? (
          <NotificationList
            notifications={notifications}
            supabase={supabase}
            onRead={() => {
              void getNotifications(supabase, userId).then(setNotifications);
              emitNotificationChanged();
            }}
          />
        ) : null}

        {userId && !loading && notifications.length === 0 ? <NotificationsEmptyState /> : null}
      </section>
    </main>
  );
}
