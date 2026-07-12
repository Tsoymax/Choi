"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import type { StoredListing } from "@/utils/listings";
import {
  LISTINGS_EVENT,
  deleteStoredListing,
  getStoredListings,
  updateStoredListingStatus
} from "@/utils/listings";
import { CURRENT_USER_ID } from "@/utils/users";

type ListingTab = "active" | "sold";

export function MyListings() {
  const [listings, setListings] = useState<StoredListing[]>([]);
  const [activeTab, setActiveTab] = useState<ListingTab>("active");

  useEffect(() => {
    const syncListings = () =>
      setListings(
        getStoredListings().filter((listing) => listing.sellerId === CURRENT_USER_ID)
      );

    syncListings();
    window.addEventListener(LISTINGS_EVENT, syncListings);
    window.addEventListener("storage", syncListings);

    return () => {
      window.removeEventListener(LISTINGS_EVENT, syncListings);
      window.removeEventListener("storage", syncListings);
    };
  }, []);

  const filteredListings = useMemo(
    () => listings.filter((listing) => (listing.status ?? "active") === activeTab),
    [activeTab, listings]
  );

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Мои объявления</h2>
          <p className="mt-1 text-sm text-ink/58">
            Управляйте объявлениями, опубликованными на Choi
          </p>
        </div>
        <div className="flex rounded-full bg-mist p-1">
          {(["active", "sold"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`focus-ring rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? "bg-leaf text-white" : "text-ink hover:bg-white"
              }`}
            >
              {tab === "active" ? "Активные" : "Проданные"}
            </button>
          ))}
        </div>
      </div>

      {filteredListings.length > 0 ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="relative">
              <ListingCard product={listing} language="ru" />
              <div className="mt-3 grid gap-2 rounded-2xl border border-ink/10 bg-white p-3 sm:grid-cols-3">
                <Link
                  href={`/sell?editId=${listing.id}`}
                  className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-mist px-3 text-sm font-semibold text-ink transition hover:bg-[#e4eee7]"
                >
                  <MoreHorizontal size={16} />
                  Редактировать
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    updateStoredListingStatus(
                      listing.id,
                      (listing.status ?? "active") === "active" ? "sold" : "active"
                    )
                  }
                  className="focus-ring h-10 rounded-full border border-ink/10 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf/30"
                >
                  {(listing.status ?? "active") === "active"
                    ? "Отметить проданным"
                    : "Вернуть в активные"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteStoredListing(listing.id)}
                  className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#fff2ef] px-3 text-sm font-semibold text-coral transition hover:bg-[#ffe4dc]"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] bg-mist p-8 text-center">
          <p className="text-lg font-semibold text-ink">
            {activeTab === "active" ? "Активных объявлений пока нет" : "Проданных объявлений пока нет"}
          </p>
          <p className="mt-2 text-sm text-ink/58">
            Новые объявления, которые вы создадите, появятся здесь.
          </p>
          <Link
            href="/sell"
            className="focus-ring mt-5 inline-flex h-12 items-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
          >
            Подать объявление
          </Link>
        </div>
      )}
    </section>
  );
}
