"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import type { Language } from "@/components/i18n";
import type { Listing } from "@/utils/listings";
import { getAllListings } from "@/utils/listings";
import { FAVORITES_EVENT, getFavoriteIdsAsync, isUuid } from "@/utils/favorites";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  getListingsByIds,
  mapListingRowToProduct
} from "@/lib/data/listings";
import { createClient } from "@/utils/supabase/client";

export default function FavoritesPage() {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    let mounted = true;

    const syncFavorites = async () => {
      const ids = await getFavoriteIdsAsync();
      let nextListings = getAllListings();
      const remoteIds = ids.filter(isUuid);

      if (hasSupabaseBrowserEnv() && remoteIds.length > 0) {
        const supabase = createClient();
        const remoteListings = await getListingsByIds(supabase, remoteIds);
        const mappedRemoteListings = remoteListings.map(
          (listing) => mapListingRowToProduct(listing) as Listing
        );
        const localOnlyListings = nextListings.filter(
          (listing) =>
            !mappedRemoteListings.some((remoteListing) => remoteListing.id === listing.id)
        );

        nextListings = [...mappedRemoteListings, ...localOnlyListings];
      }

      if (!mounted) {
        return;
      }

      setFavoriteIds(ids);
      setListings(nextListings);
    };

    void syncFavorites();
    window.addEventListener(FAVORITES_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      mounted = false;
      window.removeEventListener(FAVORITES_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  const favoriteListings = useMemo(
    () =>
      favoriteIds
        .map((id) => listings.find((listing) => listing.id === id))
        .filter((listing): listing is Listing => Boolean(listing)),
    [favoriteIds, listings]
  );

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />

      <section className="mx-auto max-w-[1504px] px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring mb-6 inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30"
        >
          <ArrowLeft size={17} />
          На главную
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Избранное
          </h1>
          <p className="mt-3 text-lg text-ink/62">
            Объявления, которые вы сохранили
          </p>
        </div>

        {favoriteListings.length > 0 ? (
          <div className="grid gap-5 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} product={listing} language="ru" />
            ))}
          </div>
        ) : (
          <section className="overflow-hidden rounded-[24px] bg-white p-8 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-10">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
              <div>
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-mist text-leaf">
                  <Heart size={26} />
                </div>
                <h2 className="text-3xl font-semibold text-ink">Пока здесь тихо</h2>
                <p className="mt-3 max-w-xl text-lg leading-8 text-ink/62">
                  Сохраняйте интересные объявления, нажимая на сердечко
                </p>
                <Link
                  href="/"
                  className="focus-ring mt-7 inline-flex h-14 items-center justify-center rounded-full bg-leaf px-7 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
                >
                  Смотреть объявления
                </Link>
              </div>
              <div className="relative mx-auto hidden aspect-square w-full max-w-[260px] md:block">
                <Image
                  src="/images/choi-teapot.png"
                  alt="Choi teapot"
                  fill
                  className="object-contain drop-shadow-[0_22px_34px_rgba(24,32,29,0.12)]"
                  sizes="260px"
                />
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
