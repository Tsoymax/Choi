import type { Listing } from "@/utils/listings";
import { getCategoryLabel, getDistrictLabel } from "@/utils/listings";
import { sellCategories, tashkentDistricts } from "@/components/sell/sellData";
import type { Coordinates, DistanceRadius } from "@/lib/location/distance";
import { getListingDistance, isInsideRadius } from "@/lib/location/distance";
import { getLocationForDistrict } from "@/lib/location/currentLocation";
import { getAttributeField } from "@/data/listingAttributeConfig";

export type SearchSort = "default" | "newest" | "cheap" | "expensive" | "nearby";

export type SearchFiltersState = {
  q: string;
  category: string;
  subcategory: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  currency: "" | "uzs" | "usd";
  sort: SearchSort;
  distanceRadius: DistanceRadius;
  onlyWithPhoto: boolean;
  onlyNew: boolean;
  onlyBargain: boolean;
  onlyActive: boolean;
  negotiable: boolean;
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  mileageFrom: string;
  mileageTo: string;
  transmission: string;
  fuel: string;
  drive: string;
  body: string;
  engine: string;
  color: string;
  exchange: string;
  dealType: string;
  rooms: string;
  areaFrom: string;
  areaTo: string;
  floor: string;
  renovation: string;
  furniture: string;
  parking: string;
  condition: string;
  memory: string;
  warranty: string;
  gender: string;
  size: string;
};

export const defaultSearchFilters: SearchFiltersState = {
  q: "",
  category: "",
  subcategory: "",
  district: "",
  minPrice: "",
  maxPrice: "",
  currency: "",
  sort: "default",
  distanceRadius: "all",
  onlyWithPhoto: false,
  onlyNew: false,
  onlyBargain: false,
  onlyActive: true,
  negotiable: false,
  brand: "",
  model: "",
  yearFrom: "",
  yearTo: "",
  mileageFrom: "",
  mileageTo: "",
  transmission: "",
  fuel: "",
  drive: "",
  body: "",
  engine: "",
  color: "",
  exchange: "",
  dealType: "",
  rooms: "",
  areaFrom: "",
  areaTo: "",
  floor: "",
  renovation: "",
  furniture: "",
  parking: "",
  condition: "",
  memory: "",
  warranty: "",
  gender: "",
  size: ""
};

export const SEARCH_HISTORY_EVENT = "choi:search-history-changed";
const SEARCH_HISTORY_LIMIT = 10;

export const popularSearches = [
  "Cobalt",
  "iPhone",
  "Квартира",
  "Кондиционер",
  "Camry",
  "Gentra"
];

function normalize(value?: string | number) {
  return String(value ?? "").trim().toLowerCase();
}

function searchHistoryKey(userId: string) {
  return `choi:search-history:${userId}`;
}

export function getSearchHistory(userId?: string | null) {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(searchHistoryKey(userId)) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, SEARCH_HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveSearchHistoryItem(userId: string | null | undefined, query: string) {
  const nextQuery = query.trim();
  if (!userId || !nextQuery || typeof window === "undefined") {
    return;
  }

  const current = getSearchHistory(userId);
  const next = [
    nextQuery,
    ...current.filter((item) => normalize(item) !== normalize(nextQuery))
  ].slice(0, SEARCH_HISTORY_LIMIT);

  window.localStorage.setItem(searchHistoryKey(userId), JSON.stringify(next));
  window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
}

export function clearSearchHistory(userId?: string | null) {
  if (!userId || typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(searchHistoryKey(userId));
  window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
}

function matchesCategory(listing: Listing, category: string) {
  if (!category) {
    return true;
  }

  const target = normalize(category);
  const categoryOption = sellCategories.find(
    (item) => normalize(item.id) === target || normalize(item.label) === target
  );

  return (
    normalize(listing.category) === target ||
    normalize(listing.category) === normalize(categoryOption?.id) ||
    normalize(getCategoryLabel(listing.category)) === target
  );
}

function matchesDistrict(listing: Listing, district: string) {
  if (!district) {
    return true;
  }

  const target = normalize(district);
  const districtOption = tashkentDistricts.find(
    (item) => normalize(item.id) === target || normalize(item.label) === target
  );

  return (
    normalize(listing.district) === target ||
    normalize(listing.district) === normalize(districtOption?.id) ||
    normalize(getDistrictLabel(listing.district)) === target
  );
}

function matchesQuery(listing: Listing, query: string) {
  const q = normalize(query);
  if (!q) {
    return true;
  }

  const haystack = [
    listing.title,
    listing.titleRu,
    listing.titleUz,
    listing.description,
    listing.seller,
    getCategoryLabel(listing.category),
    sellCategories.find((category) => category.id === listing.category)?.label,
    ...Object.entries(listing.attributes ?? {}).flatMap(([key, value]) => [
      key,
      value,
      getAttributeField(listing.category, key)?.label
    ])
  ]
    .map(normalize)
    .join(" ");

  return haystack.includes(q);
}

function getAttribute(listing: Listing, key: string) {
  return listing.attributes?.[key] ?? "";
}

function matchesAttribute(listing: Listing, key: string, expected: string) {
  if (!expected) {
    return true;
  }

  return normalize(getAttribute(listing, key)) === normalize(expected);
}

function matchesAttributeLike(listing: Listing, key: string, expected: string) {
  if (!expected) {
    return true;
  }

  return normalize(getAttribute(listing, key)).includes(normalize(expected));
}

function matchesNumberRange(
  value: string,
  from?: string,
  to?: string
) {
  const numericValue = Number(value);
  if (!value || Number.isNaN(numericValue)) {
    return !from && !to;
  }

  if (from && numericValue < Number(from)) return false;
  if (to && numericValue > Number(to)) return false;
  return true;
}

function isNewListing(listing: Listing) {
  if (!listing.createdAt) {
    return false;
  }

  const createdAt = new Date(listing.createdAt).getTime();
  if (Number.isNaN(createdAt)) {
    return false;
  }

  return Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000;
}

function matchesDynamicFilters(listing: Listing, filters: SearchFiltersState) {
  if (filters.subcategory) {
    const subcategoryKeys = [
      "service_category",
      "home_category",
      "business_category",
      "part_type"
    ];
    if (!subcategoryKeys.some((key) => matchesAttributeLike(listing, key, filters.subcategory))) {
      return false;
    }
  }

  if (!matchesAttribute(listing, "brand", filters.brand)) return false;
  if (!matchesAttribute(listing, "model", filters.model)) return false;
  if (!matchesNumberRange(getAttribute(listing, "year"), filters.yearFrom, filters.yearTo)) return false;
  if (!matchesNumberRange(getAttribute(listing, "mileage"), filters.mileageFrom, filters.mileageTo)) return false;
  if (!matchesAttribute(listing, "transmission", filters.transmission)) return false;
  if (!matchesAttribute(listing, "fuel", filters.fuel)) return false;
  if (!matchesAttribute(listing, "drive", filters.drive)) return false;
  if (!matchesAttribute(listing, "body", filters.body)) return false;
  if (!matchesAttributeLike(listing, "engine", filters.engine)) return false;
  if (!matchesAttributeLike(listing, "color", filters.color)) return false;
  if (!matchesAttribute(listing, "exchange", filters.exchange)) return false;
  if (!matchesAttribute(listing, "deal_type", filters.dealType)) return false;
  if (!matchesAttribute(listing, "rooms", filters.rooms)) return false;
  if (!matchesNumberRange(getAttribute(listing, "area"), filters.areaFrom, filters.areaTo)) return false;
  if (!matchesAttribute(listing, "floor", filters.floor)) return false;
  if (!matchesAttribute(listing, "renovation", filters.renovation)) return false;
  if (!matchesAttribute(listing, "furniture", filters.furniture)) return false;
  if (!matchesAttribute(listing, "parking", filters.parking)) return false;
  if (!matchesAttribute(listing, "condition", filters.condition)) return false;
  if (!matchesAttributeLike(listing, "memory", filters.memory)) return false;
  if (!matchesAttribute(listing, "warranty", filters.warranty)) return false;
  if (!matchesAttribute(listing, "gender", filters.gender)) return false;
  if (!matchesAttributeLike(listing, "size", filters.size)) return false;

  return true;
}

function compareOptionalDistance(a?: number, b?: number) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "number") return -1;
  if (typeof b === "number") return 1;
  return 0;
}

export function filterListings(
  listings: Listing[],
  filters: SearchFiltersState,
  currentLocation?: Coordinates,
  homeDistrict = "yunusabad"
) {
  const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;
  const location = currentLocation ?? getLocationForDistrict(homeDistrict);

  const filteredListings = listings.filter((listing) => {
    const status = listing.status ?? "active";
    if (filters.onlyActive && status !== "active" && status !== "reserved") return false;
    if (!matchesQuery(listing, filters.q)) return false;
    if (!matchesCategory(listing, filters.category)) return false;
    if (!matchesDistrict(listing, filters.district)) return false;
    if (filters.onlyWithPhoto && !listing.image) return false;
    if (filters.negotiable && !listing.negotiable) return false;
    if (filters.onlyNew && !isNewListing(listing)) return false;
    if (
      filters.onlyBargain &&
      !listing.negotiable &&
      normalize(getAttribute(listing, "bargain")) !== "yes"
    ) {
      return false;
    }
    if (filters.currency && listing.currency !== filters.currency) return false;
    if (!matchesDynamicFilters(listing, filters)) return false;

    const distanceKm = getListingDistance(listing, location);
    if (!isInsideRadius(listing, distanceKm, filters.distanceRadius, homeDistrict)) return false;

    if (!listing.negotiable) {
      if (typeof minPrice === "number" && listing.price < minPrice) return false;
      if (typeof maxPrice === "number" && listing.price > maxPrice) return false;
    }

    return true;
  });

  return filteredListings.map((listing) => ({
    ...listing,
    distanceKm: getListingDistance(listing, location)
  })).sort((a, b) => {
    if (filters.sort === "cheap") return a.price - b.price;
    if (filters.sort === "expensive") return b.price - a.price;
    if (filters.sort === "nearby") {
      return compareOptionalDistance(
        getListingDistance(a, location),
        getListingDistance(b, location)
      );
    }

    if (filters.sort === "newest") {
      return (
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
      );
    }

    return (
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
    );
  });
}

export function filtersFromSearchParams(searchParams: URLSearchParams): SearchFiltersState {
  const sort = searchParams.get("sort");
  const distanceRadius = searchParams.get("distanceRadius");

  return {
    q: searchParams.get("q") ?? "",
    category: searchParams.get("category") ?? "",
    subcategory: searchParams.get("subcategory") ?? "",
    district: searchParams.get("district") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    currency: searchParams.get("currency") === "usd" ? "usd" : searchParams.get("currency") === "uzs" ? "uzs" : "",
    sort:
      sort === "default" ||
      sort === "newest" ||
      sort === "cheap" ||
      sort === "expensive" ||
      sort === "nearby"
        ? sort
        : "default",
    distanceRadius:
      distanceRadius === "district" ||
      distanceRadius === "3" ||
      distanceRadius === "5" ||
      distanceRadius === "10" ||
      distanceRadius === "all"
        ? distanceRadius
        : "all",
    onlyWithPhoto: searchParams.get("onlyWithPhoto") === "true",
    onlyNew: searchParams.get("onlyNew") === "true",
    onlyBargain: searchParams.get("onlyBargain") === "true",
    onlyActive: searchParams.get("onlyActive") !== "false",
    negotiable: searchParams.get("negotiable") === "true",
    brand: searchParams.get("brand") ?? "",
    model: searchParams.get("model") ?? "",
    yearFrom: searchParams.get("yearFrom") ?? "",
    yearTo: searchParams.get("yearTo") ?? "",
    mileageFrom: searchParams.get("mileageFrom") ?? "",
    mileageTo: searchParams.get("mileageTo") ?? "",
    transmission: searchParams.get("transmission") ?? "",
    fuel: searchParams.get("fuel") ?? "",
    drive: searchParams.get("drive") ?? "",
    body: searchParams.get("body") ?? "",
    engine: searchParams.get("engine") ?? "",
    color: searchParams.get("color") ?? "",
    exchange: searchParams.get("exchange") ?? "",
    dealType: searchParams.get("dealType") ?? "",
    rooms: searchParams.get("rooms") ?? "",
    areaFrom: searchParams.get("areaFrom") ?? "",
    areaTo: searchParams.get("areaTo") ?? "",
    floor: searchParams.get("floor") ?? "",
    renovation: searchParams.get("renovation") ?? "",
    furniture: searchParams.get("furniture") ?? "",
    parking: searchParams.get("parking") ?? "",
    condition: searchParams.get("condition") ?? "",
    memory: searchParams.get("memory") ?? "",
    warranty: searchParams.get("warranty") ?? "",
    gender: searchParams.get("gender") ?? "",
    size: searchParams.get("size") ?? ""
  };
}

export function filtersToSearchParams(filters: SearchFiltersState) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || value === defaultSearchFilters[key as keyof SearchFiltersState]) {
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

export function getActiveFilterChips(filters: SearchFiltersState) {
  const chips: Array<{ key: keyof SearchFiltersState; label: string }> = [];

  const add = (key: keyof SearchFiltersState, label: string) => {
    const value = filters[key];
    if (value && value !== defaultSearchFilters[key]) {
      chips.push({ key, label });
    }
  };

  add("q", filters.q);
  add(
    "category",
    sellCategories.find(
      (category) =>
        normalize(category.id) === normalize(filters.category) ||
        normalize(category.label) === normalize(filters.category)
    )?.label ?? filters.category
  );
  add("subcategory", filters.subcategory);
  add("district", getDistrictLabel(filters.district));
  add("minPrice", `от ${filters.minPrice}`);
  add("maxPrice", `до ${filters.maxPrice}`);
  add("currency", filters.currency === "uzs" ? "сум" : filters.currency === "usd" ? "USD" : "");
  add("brand", filters.brand);
  add("model", filters.model);
  add("yearFrom", `${filters.yearFrom}+`);
  add("yearTo", `до ${filters.yearTo}`);
  add("mileageFrom", `пробег от ${filters.mileageFrom}`);
  add("mileageTo", `пробег до ${filters.mileageTo}`);
  add("transmission", filters.transmission);
  add("fuel", filters.fuel);
  add("drive", filters.drive);
  add("body", filters.body);
  add("engine", filters.engine);
  add("color", filters.color);
  add("exchange", filters.exchange === "yes" ? "обмен: да" : filters.exchange === "no" ? "обмен: нет" : "");
  add("dealType", filters.dealType);
  add("rooms", `${filters.rooms} комн.`);
  add("areaFrom", `площадь от ${filters.areaFrom}`);
  add("areaTo", `площадь до ${filters.areaTo}`);
  add("floor", `этаж ${filters.floor}`);
  add("renovation", filters.renovation);
  add("furniture", filters.furniture === "yes" ? "мебель: да" : filters.furniture === "no" ? "мебель: нет" : "");
  add("parking", filters.parking === "yes" ? "парковка: да" : filters.parking === "no" ? "парковка: нет" : "");
  add("condition", filters.condition);
  add("memory", filters.memory);
  add("warranty", filters.warranty === "yes" ? "гарантия: да" : filters.warranty === "no" ? "гарантия: нет" : "");
  add("gender", filters.gender);
  add("size", filters.size);

  if (filters.onlyWithPhoto) chips.push({ key: "onlyWithPhoto", label: "с фото" });
  if (filters.onlyNew) chips.push({ key: "onlyNew", label: "новые 7 дней" });
  if (filters.onlyBargain) chips.push({ key: "onlyBargain", label: "с торгом" });
  if (!filters.onlyActive) chips.push({ key: "onlyActive", label: "все статусы" });
  if (filters.negotiable) chips.push({ key: "negotiable", label: "договорная" });

  return chips.filter((chip) => chip.label);
}
