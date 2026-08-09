"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, Heart, MapPin } from "lucide-react";
import type { Product } from "./types";
import type { Language } from "./i18n";
import { FAVORITES_EVENT, isFavoriteAsync, toggleFavoriteAsync } from "@/utils/favorites";
import { formatListingDate, formatListingPrice, getDistrictLabel } from "@/utils/listings";
import { formatAutoListingMeta, getAutoListingTitle } from "@/utils/autoListingMeta";
import { getCarColorStyle, getCarColorTextStyle } from "@/utils/carColors";
import {
  formatElectronicsListingMeta,
  getElectronicsListingTitle
} from "@/utils/electronicsListingMeta";
import {
  formatRealEstateListingMeta,
  getRealEstateListingTitle
} from "@/utils/realEstateListingMeta";
import { setCachedListingLikes } from "@/utils/listingEngagementCache";
import {
  getCurrentUser as getCurrentAuthUser,
  hasSupabaseBrowserEnv,
  requireCurrentUser
} from "@/lib/auth/client";
import { formatDistanceKm } from "@/lib/location/distance";
import { CURRENT_USER_ID } from "@/utils/users";

type ListingCardProps = {
  product: Product;
  language: Language;
};

function formatMetric(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

export function ListingCard({ product, language }: ListingCardProps) {
  const router = useRouter();
  const rawTitle =
    language === "uz" ? product.titleUz ?? product.title : product.titleRu ?? product.title;
  const title =
    product.category === "auto"
      ? getAutoListingTitle(product.attributes)
      : product.category === "real-estate"
      ? getRealEstateListingTitle(product.attributes)
      : product.category === "electronics"
        ? getElectronicsListingTitle(product.attributes)
        : rawTitle;
  const [favorite, setFavorite] = useState(false);
  const [likesCount, setLikesCount] = useState(product.likesCount ?? 0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    hasSupabaseBrowserEnv() ? null : CURRENT_USER_ID
  );
  const distanceLabel = formatDistanceKm(product.distanceKm);
  const photos = product.images?.length ? product.images : [product.image];
  const viewsCount = product.viewsCount ?? 0;
  const isOwnListing = Boolean(product.sellerId && currentUserId === product.sellerId);
  const autoMeta =
    product.category === "auto" ? formatAutoListingMeta(product.attributes) : "";
  const realEstateMeta =
    product.category === "real-estate" ? formatRealEstateListingMeta(product.attributes) : "";
  const electronicsMeta =
    product.category === "electronics" ? formatElectronicsListingMeta(product.attributes) : "";
  const listingMeta = autoMeta || realEstateMeta || electronicsMeta;
  const displayColor =
    product.category === "auto" || product.category === "electronics"
      ? product.attributes?.color
      : "";

  useEffect(() => {
    setLikesCount(product.likesCount ?? 0);
  }, [product.id, product.likesCount]);

  useEffect(() => {
    let mounted = true;

    async function syncCurrentUser() {
      if (!hasSupabaseBrowserEnv()) {
        setCurrentUserId(CURRENT_USER_ID);
        return;
      }

      const user = await getCurrentAuthUser();

      if (mounted) {
        setCurrentUserId(user?.id ?? null);
      }
    }

    void syncCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const syncFavorite = () => {
      void isFavoriteAsync(product.id).then(setFavorite);
    };

    syncFavorite();
    window.addEventListener(FAVORITES_EVENT, syncFavorite);
    window.addEventListener("storage", syncFavorite);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorite);
      window.removeEventListener("storage", syncFavorite);
    };
  }, [product.id]);

  function openListing() {
    router.push(`/listing/${product.id}` as never);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openListing}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openListing();
        }
      }}
      className="group block cursor-pointer overflow-hidden rounded-[22px] border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f5ef]">
        <div className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {photos.map((photo, index) => (
            <div key={`${photo}-${index}`} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={photo}
                alt={index === 0 ? title : `${title}, фото ${index + 1}`}
                fill
                unoptimized={photo.startsWith("data:")}
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 92vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
        {photos.length > 1 ? (
          <div className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink/28 px-2 py-1 backdrop-blur">
            {photos.slice(0, 5).map((photo, index) => (
              <span
                key={`${photo}-dot-${index}`}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === 0 ? "bg-white" : "bg-white/55"
                }`}
              />
            ))}
          </div>
        ) : null}
        {isOwnListing ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-leaf shadow-sm backdrop-blur">
            Моё
          </span>
        ) : null}
        <button
          type="button"
          onClick={async (event) => {
            event.stopPropagation();
            const user = await requireCurrentUser(
              router,
              `${window.location.pathname}${window.location.search}`
            );

            if (!user) {
              return;
            }

            const nextFavorite = !favorite;
            const nextLikesCount = Math.max(0, likesCount + (nextFavorite ? 1 : -1));
            setFavorite(nextFavorite);
            setLikesCount(nextLikesCount);
            setCachedListingLikes(product.id, nextLikesCount);
            await toggleFavoriteAsync(product.id);
          }}
          className={`focus-ring absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full shadow-sm transition sm:h-10 sm:w-10 ${
            favorite ? "bg-leaf text-white" : "bg-white/88 text-ink hover:text-leaf"
          }`}
          aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Heart size={18} className={favorite ? "fill-white" : ""} />
        </button>
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug text-ink [overflow-wrap:anywhere] sm:text-lg">
          {title}
        </h3>
        {listingMeta ? (
          <p className="mt-1 line-clamp-2 break-words text-[15px] font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
            {listingMeta}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <strong className="break-words text-lg font-semibold text-ink [overflow-wrap:anywhere]">
            {formatListingPrice(product)}
          </strong>
          {displayColor ? (
            <span
              className="inline-flex min-w-0 items-center gap-1.5 break-words text-sm font-semibold [overflow-wrap:anywhere]"
              style={{ color: getCarColorTextStyle(displayColor) }}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink/10 shadow-sm"
                style={{ background: getCarColorStyle(displayColor) }}
              />
              {displayColor}
            </span>
          ) : null}
        </div>
        {product.status === "reserved" ? (
          <span className="mt-2 inline-flex rounded-full bg-leaf/10 px-3 py-1 text-xs font-semibold text-leaf">
            Забронировано
          </span>
        ) : null}
        <p className="mt-3 flex items-center gap-1 text-sm text-ink/58">
          <MapPin size={15} className="shrink-0 text-leaf" />
          <span className="truncate">
            {getDistrictLabel(product.district)} · {distanceLabel}
          </span>
        </p>
        <div className="mt-1 flex items-center justify-between gap-3 text-sm text-ink/50">
          <span className="min-w-0 truncate">{formatListingDate(product.createdAt)}</span>
          <span className="ml-auto flex shrink-0 items-center gap-3 text-xs font-semibold text-ink/45">
            <span className="inline-flex items-center gap-1" aria-label={`${viewsCount} просмотров`}>
              <Eye size={14} className="text-leaf" />
              {formatMetric(viewsCount)}
            </span>
            <span className="inline-flex items-center gap-1" aria-label={`${likesCount} понравилось`}>
              <Heart size={14} className="text-leaf" />
              {formatMetric(likesCount)}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
