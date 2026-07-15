import type { Listing } from "@/utils/listings";
import { getCategoryLabel, getDistrictLabel } from "@/utils/listings";
import { sellCategories, tashkentDistricts } from "@/components/sell/sellData";
import type { Coordinates, DistanceRadius } from "@/lib/location/distance";
import { getListingDistance, isInsideRadius } from "@/lib/location/distance";
import { getLocationForDistrict } from "@/lib/location/currentLocation";

export type SearchSort = "newest" | "cheap" | "expensive" | "nearby";

export type SearchFiltersState = {
  q: string;
  category: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  currency: "" | "uzs" | "usd";
  sort: SearchSort;
  distanceRadius: DistanceRadius;
  onlyWithPhoto: boolean;
  negotiable: boolean;
};

export const defaultSearchFilters: SearchFiltersState = {
  q: "",
  category: "",
  district: "",
  minPrice: "",
  maxPrice: "",
  currency: "",
  sort: "newest",
  distanceRadius: "all",
  onlyWithPhoto: false,
  negotiable: false
};

function normalize(value?: string | number) {
  return String(value ?? "").trim().toLowerCase();
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
    sellCategories.find((category) => category.id === listing.category)?.label
  ]
    .map(normalize)
    .join(" ");

  return haystack.includes(q);
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
    if (status !== "active" && status !== "reserved") return false;
    if (!matchesQuery(listing, filters.q)) return false;
    if (!matchesCategory(listing, filters.category)) return false;
    if (!matchesDistrict(listing, filters.district)) return false;
    if (filters.onlyWithPhoto && !listing.image) return false;
    if (filters.negotiable && !listing.negotiable) return false;
    if (filters.currency && listing.currency !== filters.currency) return false;

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
    district: searchParams.get("district") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    currency: searchParams.get("currency") === "usd" ? "usd" : searchParams.get("currency") === "uzs" ? "uzs" : "",
    sort: sort === "cheap" || sort === "expensive" || sort === "nearby" ? sort : "newest",
    distanceRadius:
      distanceRadius === "district" ||
      distanceRadius === "3" ||
      distanceRadius === "5" ||
      distanceRadius === "10" ||
      distanceRadius === "all"
        ? distanceRadius
        : "all",
    onlyWithPhoto: searchParams.get("onlyWithPhoto") === "true",
    negotiable: searchParams.get("negotiable") === "true"
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
