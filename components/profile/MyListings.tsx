"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import type { Listing, ListingStatus } from "@/utils/listings";
import {
  LISTINGS_EVENT,
  deleteStoredListing,
  getStoredListings,
  updateStoredListingStatus
} from "@/utils/listings";
import { CURRENT_USER_ID } from "@/utils/users";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  deleteListing as deleteRemoteListing,
  getListingsByUserId,
  mapListingRowToProduct,
  updateListingStatus
} from "@/lib/data/listings";
import { createClient } from "@/utils/supabase/client";

type ListingTab = "active" | "sold";

export function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<ListingTab>("active");

  useEffect(() => {
    let mounted = true;

    async function syncListings() {
      const localListings = getStoredListings().filter(
        (listing) => listing.sellerId === CURRENT_USER_ID
      );

      if (!hasSupabaseBrowserEnv()) {
        setListings(localListings);
        return;
      }

      const supabase = createClient();
      const user = await getCurrentUser();

      if (!user) {
        if (mounted) {
          setListings(localListings);
        }
        return;
      }

      const remoteListings = await getListingsByUserId(supabase, user.id);

      if (!mounted) {
        return;
      }

      setListings([
        ...remoteListings.map((listing) => mapListingRowToProduct(listing) as Listing),
        ...localListings
      ]);
    }

    void syncListings();
    window.addEventListener(LISTINGS_EVENT, syncListings);
    window.addEventListener("storage", syncListings);

    return () => {
      mounted = false;
      window.removeEventListener(LISTINGS_EVENT, syncListings);
      window.removeEventListener("storage", syncListings);
    };
  }, []);

  const filteredListings = useMemo(
    () =>
      listings.filter((listing) => {
        const status = listing.status ?? "active";
        if (activeTab === "active") {
          return status === "active" || status === "reserved";
        }
        return status === "sold" || status === "archived";
      }),
    [activeTab, listings]
  );

  async function changeListingStatus(listing: Listing, status: ListingStatus) {
    if (hasSupabaseBrowserEnv() && !listing.id.startsWith("local-")) {
      const supabase = createClient();
      const result = await updateListingStatus(supabase, listing.id, status);

      if (!result.error) {
        window.dispatchEvent(new Event(LISTINGS_EVENT));
      }

      return;
    }

    updateStoredListingStatus(listing.id, status);
  }

  async function deleteListing(listing: Listing) {
    if (hasSupabaseBrowserEnv() && !listing.id.startsWith("local-")) {
      const supabase = createClient();
      const result = await deleteRemoteListing(supabase, listing.id);

      if (!result.error) {
        window.dispatchEvent(new Event(LISTINGS_EVENT));
      }

      return;
    }

    deleteStoredListing(listing.id);
  }

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
                  href={`/listing/${listing.id}/edit`}
                  className={`focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-mist px-3 text-sm font-semibold text-ink transition hover:bg-[#e4eee7] ${
                    (listing.status ?? "active") === "sold" || (listing.status ?? "active") === "archived"
                      ? "pointer-events-none opacity-55"
                      : ""
                  }`}
                  aria-disabled={(listing.status ?? "active") === "sold" || (listing.status ?? "active") === "archived"}
                >
                  <MoreHorizontal size={16} />
                  Редактировать
                </Link>
                <button
                  type="button"
                  onClick={() => void changeListingStatus(listing, "archived")}
                  disabled={(listing.status ?? "active") === "sold" || (listing.status ?? "active") === "archived"}
                  className="focus-ring h-10 rounded-full border border-ink/10 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf/30 disabled:opacity-55"
                >
                  {(listing.status ?? "active") === "active" || (listing.status ?? "active") === "reserved"
                    ? "Отметить проданным"
                    : "В истории"}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteListing(listing)}
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
