"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/utils/listings";
import {
  formatListingDate,
  formatListingPrice,
  getCategoryLabel,
  getDistrictLabel,
  getListingById,
  getRelatedListings
} from "@/utils/listings";
import { ListingGallery } from "./ListingGallery";
import { SellerCard } from "./SellerCard";

type ListingDetailProps = {
  listingId: string;
};

export function ListingDetail({ listingId }: ListingDetailProps) {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [listing, setListing] = useState<Listing | undefined>(() => getListingById(listingId));

  useEffect(() => {
    setListing(getListingById(listingId));
  }, [listingId]);

  const relatedListings = useMemo(
    () => (listing ? getRelatedListings(listing) : []),
    [listing]
  );

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

  const title = listing.titleRu ?? listing.title;
  const images = listing.images?.length ? listing.images : [listing.image];

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
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

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <ListingGallery images={images} title={title} />

            <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <h2 className="text-2xl font-semibold text-ink">Описание</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink/72">
                {listing.description || "Продавец пока не добавил подробное описание."}
              </p>
            </section>

            <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <h2 className="text-2xl font-semibold text-ink">Местоположение</h2>
              <p className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-ink">
                <MapPin size={20} className="text-leaf" />
                {getDistrictLabel(listing.district)}
              </p>
              <p className="mt-2 text-sm text-ink/58">
                Точное место встречи продавец сообщит в чате
              </p>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[24px] bg-white p-6 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
              <p className="text-3xl font-semibold text-leaf">
                {formatListingPrice(listing)}
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {title}
              </h1>
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

            <SellerCard listing={listing} />
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
