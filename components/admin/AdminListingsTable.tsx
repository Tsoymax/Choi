"use client";

import Link from "next/link";
import { EyeOff, RotateCcw, ShieldX, Trash2 } from "lucide-react";
import type { AdminListingRow } from "@/lib/data/admin";
import type { ModerationAction } from "@/lib/data/reports";
import type { ProfileRow } from "@/lib/data/profiles";

export type ListingActionRequest = {
  type: "listing";
  id: string;
  action: Extract<
    ModerationAction,
    "hide_listing" | "block_listing" | "restore_listing" | "delete_listing"
  >;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
};

type AdminListingsTableProps = {
  listings: AdminListingRow[];
  profiles: ProfileRow[];
  onAction: (request: ListingActionRequest) => void;
};

const statusLabels: Record<string, string> = {
  active: "Активно",
  reserved: "Забронировано",
  sold: "Продано",
  archived: "Архив",
  hidden: "Скрыто",
  blocked: "Заблокировано"
};

export function AdminListingsTable({
  listings,
  profiles,
  onAction
}: AdminListingsTableProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <h2 className="text-2xl font-semibold text-ink">Объявлений пока нет</h2>
      </div>
    );
  }

  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-6">
      <h2 className="text-2xl font-semibold text-ink">Объявления</h2>
      <div className="mt-5 grid gap-3">
        {listings.map((listing) => {
          const owner = profiles.find((profile) => profile.id === listing.user_id);
          const status = listing.status ?? "active";

          return (
            <article
              key={listing.id}
              className="grid gap-4 rounded-2xl border border-ink/10 p-4 lg:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-leaf">
                    {statusLabels[status] ?? status}
                  </span>
                  <span className="text-xs text-ink/45">
                    {listing.category} · {listing.district}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-lg font-semibold text-ink">
                  {listing.title}
                </h3>
                <p className="mt-1 text-sm text-ink/58">
                  Владелец: {owner?.name ?? listing.user_id}
                </p>
                <Link
                  href={`/listing/${listing.id}`}
                  className="mt-2 inline-flex text-sm font-semibold text-leaf hover:underline"
                >
                  Открыть объявление
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {status !== "hidden" ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAction({
                        type: "listing",
                        id: listing.id,
                        action: "hide_listing",
                        title: "Скрыть объявление",
                        description: "Объявление пропадет из публичной ленты.",
                        confirmLabel: "Скрыть"
                      })
                    }
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink"
                  >
                    <EyeOff size={16} />
                    Скрыть
                  </button>
                ) : null}
                {status === "hidden" || status === "blocked" || status === "archived" ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAction({
                        type: "listing",
                        id: listing.id,
                        action: "restore_listing",
                        title: "Вернуть объявление",
                        description: "Объявление снова станет активным.",
                        confirmLabel: "Вернуть"
                      })
                    }
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-ink"
                  >
                    <RotateCcw size={16} />
                    Вернуть
                  </button>
                ) : null}
                {status !== "blocked" ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAction({
                        type: "listing",
                        id: listing.id,
                        action: "block_listing",
                        title: "Заблокировать объявление",
                        description: "Используйте для опасных или запрещенных объявлений.",
                        confirmLabel: "Заблокировать",
                        danger: true
                      })
                    }
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-[#fff2ef] px-4 text-sm font-semibold text-coral"
                  >
                    <ShieldX size={16} />
                    Блок
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    onAction({
                      type: "listing",
                      id: listing.id,
                      action: "delete_listing",
                      title: "Удалить объявление",
                      description: "Это действие нельзя отменить. Изображения удалятся каскадом из таблицы, файлы Storage можно очистить отдельно по папке объявления.",
                      confirmLabel: "Удалить",
                      danger: true
                    })
                  }
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-coral/20 bg-white px-4 text-sm font-semibold text-coral"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
