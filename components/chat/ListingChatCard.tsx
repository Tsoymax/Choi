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
      className="focus-ring grid grid-cols-[64px_1fr] gap-3 rounded-2xl border border-ink/10 bg-white p-3 transition hover:border-leaf/30"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-mist">
        <Image
          src={listing.image}
          alt={title}
          fill
          unoptimized={listing.image.startsWith("data:")}
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm font-semibold text-leaf">{formatListingPrice(listing)}</p>
      </div>
    </Link>
  );
}
