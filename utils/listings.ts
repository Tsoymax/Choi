import type { Product } from "@/components/types";
import categories from "@/data/categories.json";
import districts from "@/data/districts.json";
import products from "@/data/products.json";

export const STORED_LISTINGS_KEY = "choi:listings";
export const LISTINGS_EVENT = "choi:listings-changed";
export const TRUST_LEVELS = ["Янги", "Ака / Опа", "Акажон / Опажон", "Устоз", "Устози Choi"] as const;

const CURRENT_USER_ID = "current-user";
const sellerIdsByName: Record<string, string> = {
  Akmal: "seller-akmal",
  Madina: "seller-madina",
  Bekzod: "seller-bekzod",
  Nilufar: "seller-nilufar",
  Oybek: "seller-oybek",
  Sardor: "seller-sardor"
};

export type Listing = Product & {
  description?: string;
  phone?: string;
  createdAt?: string;
  images?: string[];
};

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
  images?: string[];
  latitude?: number;
  longitude?: number;
};

export type StoredListing = Listing & {
  description: string;
  phone: string;
  createdAt: string;
};

export type ListingStatus = NonNullable<Listing["status"]>;

const fallbackDescriptions: Record<string, string> = {
  "cobalt-sedan":
    "Chevrolet Cobalt 2022 в хорошем состоянии. Машина аккуратно использовалась в городе, салон чистый, документы готовы к проверке.\n\nМожно посмотреть в Юнусабаде по договоренности.",
  "apartment-chilanzar":
    "Светлая 2-комнатная квартира в Чиланзаре. Удобная планировка, свежий ремонт, рядом магазины и транспорт.\n\nПоказ возможен вечером или в выходные.",
  "iphone-14":
    "iPhone 14 Pro 256 ГБ, аккуратное состояние. Работает стабильно, камера и Face ID без проблем. В комплекте кабель и чехол.",
  "winter-coat":
    "Теплое зимнее пальто на холодную погоду. Носилось мало, ткань плотная, фурнитура целая. Подойдет для ежедневной носки.",
  "courier-job":
    "Нужен курьер на вечернюю подработку. Район работы обсуждается, выплаты после смены. Подойдет студентам и тем, кто ищет гибкий график.",
  "repair-master":
    "Мастер по мелкому ремонту дома: сборка мебели, полки, сантехника, электрика по мелочи. Выезд по Ташкенту, время согласуем заранее."
};

const fallbackPhones: Record<string, string> = {
  "cobalt-sedan": "+998901112233",
  "apartment-chilanzar": "+998903334455",
  "iphone-14": "+998907778899",
  "winter-coat": "+998935551212",
  "courier-job": "+998971234567",
  "repair-master": "+998991234321"
};

const sellerTrust: Record<string, { level: string; since: string; listings: number }> = {
  Akmal: { level: "Акажон / Опажон", since: "На Choi с 2026 года", listings: 12 },
  Madina: { level: "Ака / Опа", since: "На Choi с 2026 года", listings: 8 },
  Bekzod: { level: "Ака / Опа", since: "На Choi с 2026 года", listings: 6 },
  Nilufar: { level: "Ака / Опа", since: "На Choi с 2026 года", listings: 5 },
  Oybek: { level: "Янги", since: "На Choi с 2026 года", listings: 3 },
  Sardor: { level: "Устоз", since: "На Choi с 2026 года", listings: 18 }
};

function notifyListingsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LISTINGS_EVENT));
  }
}

function normalizeListing(product: Product): Listing {
  return {
    ...product,
    sellerId: product.sellerId ?? sellerIdsByName[product.seller],
    status: product.status ?? "active",
    description: fallbackDescriptions[product.id],
    phone: fallbackPhones[product.id],
    createdAt: "2026-07-11T09:00:00.000Z",
    images: [product.image]
  };
}

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
    return Array.isArray(listings)
      ? listings.map((listing) => ({
          ...listing,
          sellerId: listing.sellerId ?? CURRENT_USER_ID,
          status: listing.status ?? "active"
        }))
      : [];
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
    sellerId: CURRENT_USER_ID,
    category: input.category,
    district: input.district,
    price: input.price ?? 0,
    currency: input.currency,
    negotiable: input.negotiable,
    rating: 5,
    reviews: 0,
    image: input.image,
    latitude: input.latitude,
    longitude: input.longitude,
    status: "active",
    images: input.images?.length ? input.images : [input.image],
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
  notifyListingsChanged();
}

export function updateStoredListingStatus(id: string, status: ListingStatus) {
  if (typeof window === "undefined") {
    return [];
  }

  const listings = getStoredListings().map((listing) =>
    listing.id === id ? { ...listing, status } : listing
  );
  window.localStorage.setItem(STORED_LISTINGS_KEY, JSON.stringify(listings));
  notifyListingsChanged();
  return listings;
}

export function deleteStoredListing(id: string) {
  if (typeof window === "undefined") {
    return [];
  }

  const listings = getStoredListings().filter((listing) => listing.id !== id);
  window.localStorage.setItem(STORED_LISTINGS_KEY, JSON.stringify(listings));
  notifyListingsChanged();
  return listings;
}

export function getStaticListings(): Listing[] {
  return (products as Product[]).map(normalizeListing);
}

export function getAllListings(): Listing[] {
  return [...getStoredListings(), ...getStaticListings()];
}

export function getListingById(id: string): Listing | undefined {
  return getAllListings().find((listing) => listing.id === id);
}

export function getRelatedListings(listing: Listing, limit = 4) {
  return getAllListings()
    .filter((item) => item.id !== listing.id && item.category === listing.category)
    .slice(0, limit);
}

export function getCategoryLabel(categoryId: string) {
  return (
    categories.find((category) => category.id === categoryId)?.labelRu ??
    categories.find((category) => category.id === categoryId)?.label ??
    categoryId
  );
}

export function getDistrictLabel(districtId: string) {
  return (
    districts.find((district) => district.id === districtId)?.labelRu ??
    districts.find((district) => district.id === districtId)?.label ??
    districtId
  );
}

export function formatListingPrice(listing: Pick<Listing, "price" | "currency" | "negotiable">) {
  if (listing.negotiable) {
    return "Договорная";
  }

  if (listing.currency === "uzs") {
    return `${new Intl.NumberFormat("ru-RU").format(listing.price)} сум`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(listing.price);
}

export function formatListingDate(createdAt?: string) {
  if (!createdAt) {
    return "Сегодня";
  }

  const createdTime = new Date(createdAt).getTime();
  const diffMs = Date.now() - createdTime;

  if (diffMs >= 0) {
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "только что";
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} дн назад`;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(createdAt));
}

export function getSellerTrust(seller: string) {
  return (
    sellerTrust[seller] ?? {
      level: "Янги",
      since: "На Choi с 2026 года",
      listings: 1
    }
  );
}
