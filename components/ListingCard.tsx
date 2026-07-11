"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, Heart, Star } from "lucide-react";
import type { Product } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/utils/favorites";
import { formatListingPrice } from "@/utils/listings";

type ListingCardProps = {
  product: Product;
  language: Language;
};

export function ListingCard({ product, language }: ListingCardProps) {
  const router = useRouter();
  const t = translations[language];
  const title =
    language === "uz" ? product.titleUz ?? product.title : product.titleRu ?? product.title;
  const badge =
    language === "uz" ? product.badgeUz ?? product.badgeRu : product.badgeRu;
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const syncFavorite = () => setFavorite(isFavorite(product.id));

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
      className="group cursor-pointer overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f5ef]">
        <Image
          src={product.image}
          alt={title}
          fill
          unoptimized={product.image.startsWith("data:")}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 50vw, 33vw"
        />
        {badge ? (
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink shadow-sm">
            {badge}
          </div>
        ) : null}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setFavorite(isFavorite(product.id) ? false : true);
            toggleFavorite(product.id);
          }}
          className={`focus-ring absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full shadow-sm transition ${
            favorite ? "bg-leaf text-white" : "bg-white/88 text-ink hover:text-leaf"
          }`}
          aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Heart size={18} className={favorite ? "fill-white" : ""} />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-ink/58">{product.seller}</p>
          </div>
          <strong className="shrink-0 text-lg font-semibold text-ink">
            {formatListingPrice(product)}
          </strong>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-ink/62">
          <span className="inline-flex items-center gap-1">
            <Star size={16} className="fill-honey text-honey" />
            {product.rating} ({product.reviews})
          </span>
          <span className="inline-flex items-center gap-1">
            <BadgeCheck size={16} className="text-leaf" />
            {t.verified}
          </span>
        </div>
      </div>
    </article>
  );
}
