"use client";

import Link from "next/link";
import { Bell, ShieldCheck, UserX } from "lucide-react";
import type { ProfileRow } from "@/lib/data/profiles";
import type { ModerationAction } from "@/lib/data/reports";

export type UserActionRequest = {
  type: "user";
  id: string;
  action: Extract<
    ModerationAction,
    "warn_user" | "temporary_block_user" | "block_user" | "unblock_user"
  >;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
};

type AdminUsersTableProps = {
  profiles: ProfileRow[];
  onAction: (request: UserActionRequest) => void;
};

export function AdminUsersTable({ profiles, onAction }: AdminUsersTableProps) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <h2 className="text-2xl font-semibold text-ink">Пользователей пока нет</h2>
      </div>
    );
  }

  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-6">
      <h2 className="text-2xl font-semibold text-ink">Пользователи</h2>
      <div className="mt-5 grid gap-3">
        {profiles.map((profile) => {
          const blocked = Boolean(profile.is_blocked);

          return (
            <article
              key={profile.id}
              className="grid gap-4 rounded-2xl border border-ink/10 p-4 lg:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-leaf">
                    {profile.role ?? "user"}
                  </span>
                  {blocked ? (
                    <span className="rounded-full bg-[#fff2ef] px-3 py-1 text-xs font-semibold text-coral">
                      Ограничен
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 truncate text-lg font-semibold text-ink">
                  {profile.name}
                </h3>
                <p className="mt-1 text-sm text-ink/58">
                  Район: {profile.district ?? "не указан"}
                </p>
                <Link
                  href={`/profile/${profile.id}`}
                  className="mt-2 inline-flex text-sm font-semibold text-leaf hover:underline"
                >
                  Открыть профиль
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onAction({
                      type: "user",
                      id: profile.id,
                      action: "warn_user",
                      title: "Отправить предупреждение",
                      description: "Пользователь получит системное уведомление.",
                      confirmLabel: "Предупредить"
                    })
                  }
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink"
                >
                  <Bell size={16} />
                  Предупредить
                </button>
                {blocked ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAction({
                        type: "user",
                        id: profile.id,
                        action: "unblock_user",
                        title: "Разблокировать профиль",
                        description: "Ограничение будет снято.",
                        confirmLabel: "Разблокировать"
                      })
                    }
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink"
                  >
                    <ShieldCheck size={16} />
                    Разблокировать
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onAction({
                          type: "user",
                          id: profile.id,
                          action: "temporary_block_user",
                          title: "Ограничить профиль на 7 дней",
                          description: "Пользователь временно получит статус ограничения.",
                          confirmLabel: "Ограничить",
                          danger: true
                        })
                      }
                      className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[#fff2ef] px-4 text-sm font-semibold text-coral"
                    >
                      <UserX size={16} />
                      7 дней
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onAction({
                          type: "user",
                          id: profile.id,
                          action: "block_user",
                          title: "Заблокировать профиль",
                          description: "Используйте только для серьезных нарушений.",
                          confirmLabel: "Заблокировать",
                          danger: true
                        })
                      }
                      className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-coral/20 bg-white px-4 text-sm font-semibold text-coral"
                    >
                      <UserX size={16} />
                      Блок
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
