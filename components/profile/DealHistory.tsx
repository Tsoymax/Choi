"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Handshake, ShoppingBag, Store } from "lucide-react";
import { ChoiTeaLoader } from "@/components/ChoiTeaLoader";
import { createClient } from "@/utils/supabase/client";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { getDealHistoryForUser, type DealHistoryItem } from "@/lib/data/deals";
import { formatListingPrice, getDistrictLabel } from "@/utils/listings";

type DealHistoryProps = {
  userId: string;
};

type DealHistoryTab = "sales" | "purchases";

function formatDealDate(date?: string | null) {
  if (!date) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

function statusLabel(status: DealHistoryItem["deal"]["status"]) {
  if (status === "confirmed") {
    return "Завершена";
  }

  return "Сорвалась";
}

export function DealHistory({ userId }: DealHistoryProps) {
  const [items, setItems] = useState<DealHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<DealHistoryTab>("sales");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      if (!hasSupabaseBrowserEnv() || !userId) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const history = await getDealHistoryForUser(supabase, userId);

      if (mounted) {
        setItems(history);
        setLoading(false);
      }
    }

    void loadHistory();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        activeTab === "sales" ? item.role === "seller" : item.role === "buyer"
      ),
    [activeTab, items]
  );

  const salesCount = items.filter((item) => item.role === "seller").length;
  const purchasesCount = items.filter((item) => item.role === "buyer").length;

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">История сделок</h2>
          <p className="mt-1 text-sm text-ink/58">
            Завершённые продажи и покупки остаются здесь
          </p>
        </div>
        <div className="flex rounded-full bg-mist p-1">
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "sales" ? "bg-leaf text-white" : "text-ink hover:bg-white"
            }`}
          >
            <Store size={16} />
            Продажи {salesCount ? `· ${salesCount}` : ""}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("purchases")}
            className={`focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "purchases" ? "bg-leaf text-white" : "text-ink hover:bg-white"
            }`}
          >
            <ShoppingBag size={16} />
            Покупки {purchasesCount ? `· ${purchasesCount}` : ""}
          </button>
        </div>
      </div>

      {loading ? (
        <>
          <ChoiTeaLoader
            label="Загружаем историю сделок"
            className="mt-6 shadow-none"
          />
          <div className="hidden">
          Загружаем историю...
          </div>
        </>
      ) : filteredItems.length > 0 ? (
        <div className="mt-6 space-y-3">
          {filteredItems.map((item) => {
            const listing = item.listing;
            const otherUser = item.role === "seller" ? item.buyer : item.seller;
            const dealDate = item.deal.confirmed_at ?? item.deal.created_at;

            return (
              <article
                key={item.deal.id}
                className="grid gap-4 rounded-[22px] border border-ink/10 bg-white p-3 shadow-sm sm:grid-cols-[96px_1fr_auto] sm:items-center"
              >
                <Link
                  href={`/listing/${item.deal.listing_id}`}
                  className="relative block aspect-square overflow-hidden rounded-2xl bg-[#f7f5ef]"
                >
                  <Image
                    src={listing?.image ?? "/images/choi-teapot.png"}
                    alt={listing?.title ?? "Объявление Choi"}
                    fill
                    unoptimized={Boolean(listing?.image?.startsWith("data:"))}
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.deal.status === "confirmed"
                          ? "bg-leaf/10 text-leaf"
                          : "bg-[#fff2ef] text-coral"
                      }`}
                    >
                      {statusLabel(item.deal.status)}
                    </span>
                    <span className="text-xs font-semibold text-ink/45">
                      {formatDealDate(dealDate)}
                    </span>
                  </div>

                  <Link
                    href={`/listing/${item.deal.listing_id}`}
                    className="mt-2 block truncate text-lg font-semibold text-ink transition hover:text-leaf"
                  >
                    {listing?.title ?? "Объявление удалено"}
                  </Link>

                  <p className="mt-1 text-sm font-semibold text-ink">
                    {listing
                      ? formatListingPrice(listing)
                      : item.deal.status === "confirmed"
                        ? "Сделка завершена"
                        : "Сделка сорвалась"}
                  </p>
                  <p className="mt-1 text-sm text-ink/58">
                    {listing?.district ? getDistrictLabel(listing.district) : "Район не указан"}
                    {otherUser?.name ? ` · ${item.role === "seller" ? "Покупатель" : "Продавец"}: ${otherUser.name}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {otherUser?.id ? (
                    <Link
                      href={`/profile/${otherUser.id}`}
                      className="focus-ring inline-flex h-10 items-center rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf/30"
                    >
                      Профиль
                    </Link>
                  ) : null}
                  {item.deal.status === "confirmed" ? (
                    <Link
                      href={`/deals/${item.deal.id}/review`}
                      className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-leaf transition hover:bg-[#e4eee7]"
                    >
                      <Handshake size={16} />
                      Отзыв
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] bg-mist p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-leaf shadow-sm">
            {activeTab === "sales" ? <Store size={24} /> : <ShoppingBag size={24} />}
          </div>
          <p className="mt-4 text-lg font-semibold text-ink">
            {activeTab === "sales" ? "Продаж пока нет" : "Покупок пока нет"}
          </p>
          <p className="mt-2 text-sm text-ink/58">
            Когда сделка завершится или сорвётся, она появится в этой истории.
          </p>
        </div>
      )}
    </section>
  );
}
