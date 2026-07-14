import { getDistrictCoordinate } from "@/data/districtCoordinates";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DistanceRadius = "district" | "3" | "5" | "10" | "all";

export const distanceRadiusOptions: Array<{ value: DistanceRadius; label: string }> = [
  { value: "district", label: "Только мой район" },
  { value: "3", label: "До 3 км" },
  { value: "5", label: "До 5 км" },
  { value: "10", label: "До 10 км" },
  { value: "all", label: "Весь Ташкент" }
];

const earthRadiusKm = 6371;

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function getListingCoordinates(listing: {
  latitude?: number | null;
  longitude?: number | null;
  district: string;
}) {
  if (typeof listing.latitude === "number" && typeof listing.longitude === "number") {
    return {
      latitude: listing.latitude,
      longitude: listing.longitude
    };
  }

  const fallback = getDistrictCoordinate(listing.district);
  return {
    latitude: fallback.latitude,
    longitude: fallback.longitude
  };
}

export function getListingDistance(
  listing: { latitude?: number | null; longitude?: number | null; district: string },
  currentLocation: Coordinates
) {
  const listingLocation = getListingCoordinates(listing);

  return calculateDistanceKm(
    currentLocation.latitude,
    currentLocation.longitude,
    listingLocation.latitude,
    listingLocation.longitude
  );
}

export function formatDistanceKm(distanceKm?: number | null) {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm)) {
    return "рядом";
  }

  if (distanceKm < 1) {
    return `${Math.max(50, Math.round(distanceKm * 1000 / 50) * 50)} м`;
  }

  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1
  }).format(distanceKm)} км`;
}

export function isInsideRadius(
  listing: { district: string },
  distanceKm: number,
  radius: DistanceRadius,
  homeDistrict: string
) {
  if (radius === "all") {
    return true;
  }

  if (radius === "district") {
    return listing.district === homeDistrict;
  }

  return distanceKm <= Number(radius);
}

export function getNextRadius(radius: DistanceRadius): DistanceRadius {
  const index = distanceRadiusOptions.findIndex((item) => item.value === radius);
  return distanceRadiusOptions[Math.min(index + 1, distanceRadiusOptions.length - 1)].value;
}

