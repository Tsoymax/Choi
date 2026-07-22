"use client";

import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/utils/listings";
import { formatListingPrice } from "@/utils/listings";

type ListingChatCardProps = {
  listing: Listing;
};

export function ListingChatCard({ listing }: ListingChatCardProps) {
  const title = listing.titleRu ?? listing.title;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="focus-ring flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-3 py-2 transition hover:border-leaf/30 hover:bg-mist/40"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mist">
        <Image
          src={listing.image}
          alt={title}
          fill
          unoptimized={listing.image.startsWith("data:")}
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <p className="truncate font-semibold text-ink">{title}</p>
        <p className="shrink-0 text-sm font-semibold text-leaf">{formatListingPrice(listing)}</p>
      </div>
    </Link>
  );
}
