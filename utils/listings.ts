import type { Product } from "@/components/types";

export const STORED_LISTINGS_KEY = "choi:listings";

export type StoredListingInput = {
  title: string;
  description: string;
  category: string;
  district: string;
  price: number | null;
  currency: "uzs" | "usd";
  negotiable: boolean;
  seller: string;
  phone: string;
  image: string;
};

export type StoredListing = Product & {
  description: string;
  phone: string;
  createdAt: string;
};

export function getStoredListings(): StoredListing[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawListings = window.localStorage.getItem(STORED_LISTINGS_KEY);
    if (!rawListings) {
      return [];
    }

    const listings = JSON.parse(rawListings);
    return Array.isArray(listings) ? listings : [];
  } catch {
    return [];
  }
}

export function saveStoredListing(input: StoredListingInput) {
  if (typeof window === "undefined") {
    return;
  }

  const listing: StoredListing = {
    id: `local-${Date.now()}`,
    title: input.title,
    titleRu: input.title,
    titleUz: input.title,
    seller: input.seller,
    category: input.category,
    district: input.district,
    price: input.price ?? 0,
    currency: input.currency,
    negotiable: input.negotiable,
    rating: 5,
    reviews: 0,
    image: input.image,
    badgeRu: "Сегодня",
    badgeUz: "Bugun",
    description: input.description,
    phone: input.phone,
    createdAt: new Date().toISOString()
  };

  const listings = getStoredListings();
  window.localStorage.setItem(
    STORED_LISTINGS_KEY,
    JSON.stringify([listing, ...listings])
  );
}
