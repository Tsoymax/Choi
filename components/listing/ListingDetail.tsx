"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Tag } from "lucide-react";
import { ChoiTeaLoader } from "@/components/ChoiTeaLoader";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/utils/listings";
import {
  LISTINGS_EVENT,
  formatListingDate,
  formatListingPrice,
  getCategoryLabel,
  getDistrictLabel,
  getListingById,
  getRelatedListings
} from "@/utils/listings";
import { CURRENT_USER_ID } from "@/utils/users";
import { hasSupabaseBrowserEnv, getCurrentUser } from "@/lib/auth/client";
import {
  getActiveListings,
  getListingById as getRemoteListingById,
  mapListingRowToProductWithMetrics,
  mapListingRowsToProductsWithMetrics
} from "@/lib/data/listings";
import { recordListingView } from "@/lib/data/listingEngagement";
import { createClient } from "@/utils/supabase/client";
import { formatAutoListingMeta } from "@/utils/autoListingMeta";
import { getCarColorStyle, getCarColorTextStyle } from "@/utils/carColors";
import { formatElectronicsListingMeta } from "@/utils/electronicsListingMeta";
import {
  formatRealEstateListingMeta,
  getRealEstateListingTitle
} from "@/utils/realEstateListingMeta";
import { markCachedListingViewed } from "@/utils/listingEngagementCache";
import { ListingGallery } from "./ListingGallery";
import { ListingAttributesSection } from "./ListingAttributesSection";
import { ListingManagement } from "./ListingManagement";
import { SellerCard } from "./SellerCard";

type ListingDetailProps = {
  listingId: string;
  initialListing?: Listing | null;
  initialCurrentUserId?: string;
};

export function ListingDetail({
  listingId,
  initialListing = null,
  initialCurrentUserId = ""
}: ListingDetailProps) {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [listing, setListing] = useState<Listing | undefined>(
    () => initialListing ?? getListingById(listingId)
  );
  const [currentUserId, setCurrentUserId] = useState(
    initialCurrentUserId || CURRENT_USER_ID
  );
  const [remoteRelatedListings, setRemoteRelatedListings] = useState<Listing[]>([]);
  const [isLoadingListing, setIsLoadingListing] = useState(!initialListing);

  useEffect(() => {
    async function syncListing() {
      const localListing = getListingById(listingId);
      setListing((current) => current ?? localListing);

      if (!hasSupabaseBrowserEnv()) {
        setIsLoadingListing(false);
        return;
      }

      const supabase = createClient();
      const [remoteListing, visibleListings, user] = await Promise.all([
        getRemoteListingById(supabase, listingId),
        getActiveListings(supabase),
        getCurrentUser()
      ]);

      if (user?.id) {
        setCurrentUserId(user.id);
      }

      if (remoteListing && user?.id && user.id !== remoteListing.user_id) {
        const wasRecorded = await recordListingView(supabase, listingId);

        if (wasRecorded && markCachedListingViewed(listingId)) {
          setListing((current) =>
            current
              ? {
                  ...current,
                  viewsCount: (current.viewsCount ?? 0) + 1
                }
              : current
          );
        }
      }

      const [remoteProduct, visibleProducts] = await Promise.all([
        remoteListing ? mapListingRowToProductWithMetrics(supabase, remoteListing) : null,
        mapListingRowsToProductsWithMetrics(
          supabase,
          visibleListings.filter((item) => item.id !== listingId)
        )
      ]);

      if (remoteListing) {
        setListing(remoteProduct as Listing);
      } else if (!localListing) {
        setListing(undefined);
      }

      setRemoteRelatedListings(
        visibleProducts as Listing[]
      );
      setIsLoadingListing(false);
    }

    void syncListing();
    window.addEventListener(LISTINGS_EVENT, syncListing);
    window.addEventListener("storage", syncListing);

    return () => {
      window.removeEventListener(LISTINGS_EVENT, syncListing);
      window.removeEventListener("storage", syncListing);
    };
  }, [listingId]);

  const relatedListings = useMemo(
    () => {
      if (!listing) {
        return [];
      }

      const remoteMatches = remoteRelatedListings
        .filter((item) => item.category === listing.category)
        .slice(0, 4);

      return remoteMatches.length > 0 ? remoteMatches : getRelatedListings(listing);
    },
    [listing, remoteRelatedListings]
  );

  if (!listing && isLoadingListing) {
    return (
      <main className="min-h-screen bg-[#f7f5ef]">
        <Header
          language={language}
          onLanguageChange={setLanguage}
          query={query}
          onQueryChange={setQuery}
        />
        <div className="mx-auto mt-10 max-w-3xl px-4">
          <ChoiTeaLoader label="Загружаем объявление" />
        </div>
        <div className="hidden">
          <h1 className="text-3xl font-semibold text-ink">Загружаем объявление</h1>
          <p className="mt-3 text-ink/62">
            Проверяем публикацию в Choi.
          </p>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#f7f5ef]">
        <Header
          language={language}
          onLanguageChange={setLanguage}
          query={query}
          onQueryChange={setQuery}
        />
        <div className="mx-auto mt-10 max-w-3xl rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <h1 className="text-3xl font-semibold text-ink">Объявление не найдено</h1>
          <p className="mt-3 text-ink/62">
            Возможно, оно было удалено или открыто на другом устройстве.
          </p>
          <Link
            href="/"
            className="focus-ring mt-6 inline-flex h-12 items-center justify-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
          >
            Вернуться на главную
          </Link>
        </div>
      </main>
    );
  }

  const rawTitle = listing.titleRu ?? listing.title;
  const title =
    listing.category === "real-estate" ? getRealEstateListingTitle(listing.attributes) : rawTitle;
  const images = listing.images?.length ? listing.images : [listing.image];
  const isOwner = listing.sellerId === currentUserId;
  const isModeratedAway = listing.status === "hidden" || listing.status === "blocked";
  const autoMeta =
    listing.category === "auto" ? formatAutoListingMeta(listing.attributes) : "";
  const realEstateMeta =
    listing.category === "real-estate" ? formatRealEstateListingMeta(listing.attributes) : "";
  const electronicsMeta =
    listing.category === "electronics" ? formatElectronicsListingMeta(listing.attributes) : "";
  const listingMeta = autoMeta || realEstateMeta || electronicsMeta;
  const displayColor =
    listing.category === "auto" || listing.category === "electronics"
      ? listing.attributes?.color
      : "";

  if (isModeratedAway && !isOwner) {
    return (
      <main className="min-h-screen bg-[#f7f5ef]">
        <Header
          language={language}
          onLanguageChange={setLanguage}
          query={query}
          onQueryChange={setQuery}
        />
        <div className="mx-auto mt-10 max-w-3xl rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <h1 className="text-3xl font-semibold text-ink">Объявление недоступно</h1>
          <p className="mt-3 text-ink/62">
            Оно скрыто модерацией или больше не опубликовано.
          </p>
          <Link
            href="/"
            className="focus-ring mt-6 inline-flex h-12 items-center justify-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
          >
            Вернуться на главную
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />
      <section className="mx-auto max-w-[1504px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring mb-5 inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-sm font-semibold text-ink shadow-sm transition hover:border-leaf/30"
        >
          <ArrowLeft size={17} />
          Назад
        </Link>

        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <ListingGallery images={images} title={title} />

            <ListingAttributesSection
              category={listing.category}
              attributes={listing.attributes}
            />

            <section className="overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <h2 className="text-2xl font-semibold text-ink">Описание</h2>
              <p className="mt-4 whitespace-pre-line break-words text-base leading-8 text-ink/72 [overflow-wrap:anywhere]">
                {listing.description || "Продавец пока не добавил подробное описание."}
              </p>
            </section>

            <section className="overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <h2 className="text-2xl font-semibold text-ink">Местоположение</h2>
              <p className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-ink">
                <MapPin size={20} className="text-leaf" />
                {getDistrictLabel(listing.district)}
              </p>
              <p className="mt-2 text-sm text-ink/58">
                Точное место встречи можно уточнить в чате
              </p>
            </section>
          </div>

          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <p className="break-words text-3xl font-semibold text-leaf [overflow-wrap:anywhere]">
                {formatListingPrice(listing)}
              </p>
              <h1 className="mt-4 break-words text-3xl font-semibold leading-tight text-ink [overflow-wrap:anywhere] sm:text-4xl">
                {title}
              </h1>
              {listingMeta ? (
                <p className="mt-3 break-words text-base font-semibold text-ink [overflow-wrap:anywhere]">
                  {listingMeta}
                </p>
              ) : null}
              {displayColor ? (
                <div
                  className="mt-2 inline-flex min-w-0 items-center gap-2 break-words text-base font-semibold [overflow-wrap:anywhere]"
                  style={{ color: getCarColorTextStyle(displayColor) }}
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 rounded-full border border-ink/10 shadow-sm"
                    style={{ background: getCarColorStyle(displayColor) }}
                  />
                  {displayColor}
                </div>
              ) : null}
              <div className="mt-6 grid gap-3 text-sm text-ink/64">
                <p className="inline-flex items-center gap-2">
                  <Tag size={17} className="text-leaf" />
                  {getCategoryLabel(listing.category)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin size={17} className="text-leaf" />
                  {getDistrictLabel(listing.district)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <CalendarDays size={17} className="text-leaf" />
                  {formatListingDate(listing.createdAt)}
                </p>
              </div>
            </section>

            {isOwner ? <ListingManagement listing={listing} /> : <SellerCard listing={listing} />}
          </div>
        </div>

        {relatedListings.length > 0 ? (
          <section className="py-12">
            <h2 className="mb-5 text-3xl font-semibold tracking-normal text-ink">
              Похожие объявления рядом
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedListings.map((item) => (
                <ListingCard key={item.id} product={item} language="ru" />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
