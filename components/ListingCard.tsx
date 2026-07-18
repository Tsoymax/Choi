"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import type { Product } from "./types";
import type { Language } from "./i18n";
import { FAVORITES_EVENT, isFavoriteAsync, toggleFavoriteAsync } from "@/utils/favorites";
import { formatListingDate, formatListingPrice, getDistrictLabel } from "@/utils/listings";
import { requireCurrentUser } from "@/lib/auth/client";
import { formatDistanceKm } from "@/lib/location/distance";

type ListingCardProps = {
  product: Product;
  language: Language;
};

export function ListingCard({ product, language }: ListingCardProps) {
  const router = useRouter();
  const title =
    language === "uz" ? product.titleUz ?? product.title : product.titleRu ?? product.title;
  const [favorite, setFavorite] = useState(false);
  const distanceLabel = formatDistanceKm(product.distanceKm);

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
      className="group grid cursor-pointer grid-cols-[116px_1fr] overflow-hidden rounded-[22px] border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft sm:block"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f7f5ef] sm:aspect-[4/3]">
        <Image
          src={product.image}
          alt={title}
          fill
          unoptimized={product.image.startsWith("data:")}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 116px, (max-width: 1200px) 50vw, 25vw"
        />
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
            setFavorite(nextFavorite);
            await toggleFavoriteAsync(product.id);
          }}
          className={`focus-ring absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full shadow-sm transition sm:right-4 sm:top-4 sm:h-10 sm:w-10 ${
            favorite ? "bg-leaf text-white" : "bg-white/88 text-ink hover:text-leaf"
          }`}
          aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Heart size={18} className={favorite ? "fill-white" : ""} />
        </button>
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink sm:text-lg">
          {title}
        </h3>
        <strong className="mt-2 block text-lg font-semibold text-ink">
          {formatListingPrice(product)}
        </strong>
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
        <p className="mt-1 text-sm text-ink/50">
          {formatListingDate(product.createdAt)}
        </p>
      </div>
    </article>
  );
}
