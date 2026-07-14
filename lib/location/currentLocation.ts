"use client";

import type { ProfileRow } from "@/lib/data/profiles";
import { ensureCurrentProfile, updateCurrentProfile } from "@/lib/data/profiles";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { defaultDistrictId, getDistrictCoordinate } from "@/data/districtCoordinates";
import type { Coordinates, DistanceRadius } from "./distance";

export const GUEST_DISTRICT_KEY = "choi_guest_district";
export const SEARCH_RADIUS_KEY = "choi_search_radius";
export const LOCATION_EVENT = "choi:location-changed";
export const defaultSearchRadius: DistanceRadius = "5";

type HomeDistrictResult = {
  district: string;
  profile: ProfileRow | null;
  authenticated: boolean;
};

function notifyLocationChanged() {
  window.dispatchEvent(new Event(LOCATION_EVENT));
}

export function getGuestDistrict() {
  if (typeof window === "undefined") {
    return defaultDistrictId;
  }

  return window.localStorage.getItem(GUEST_DISTRICT_KEY) || defaultDistrictId;
}

export function setGuestDistrict(district: string) {
  window.localStorage.setItem(GUEST_DISTRICT_KEY, district);
  notifyLocationChanged();
}

export function getStoredSearchRadius(): DistanceRadius {
  if (typeof window === "undefined") {
    return defaultSearchRadius;
  }

  const value = window.localStorage.getItem(SEARCH_RADIUS_KEY);
  return value === "district" || value === "3" || value === "5" || value === "10" || value === "all"
    ? value
    : defaultSearchRadius;
}

export function setStoredSearchRadius(radius: DistanceRadius) {
  window.localStorage.setItem(SEARCH_RADIUS_KEY, radius);
  notifyLocationChanged();
}

export function getLocationForDistrict(district: string): Coordinates {
  const coordinates = getDistrictCoordinate(district);
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude
  };
}

export async function loadHomeDistrict(): Promise<HomeDistrictResult> {
  if (!hasSupabaseBrowserEnv()) {
    return {
      district: getGuestDistrict(),
      profile: null,
      authenticated: false
    };
  }

  const { profile } = await ensureCurrentProfile();

  if (profile) {
    return {
      district: profile.district || getGuestDistrict(),
      profile,
      authenticated: true
    };
  }

  return {
    district: getGuestDistrict(),
    profile: null,
    authenticated: false
  };
}

export async function saveHomeDistrict(district: string, currentProfile?: ProfileRow | null) {
  if (!hasSupabaseBrowserEnv()) {
    setGuestDistrict(district);
    return { profile: null, authenticated: false };
  }

  const profile = currentProfile ?? (await ensureCurrentProfile()).profile;

  if (!profile) {
    setGuestDistrict(district);
    return { profile: null, authenticated: false };
  }

  const { profile: updatedProfile, error } = await updateCurrentProfile({
    name: profile.name || "Choi",
    district,
    addressType: profile.address_type === "opa" ? "opa" : "aka"
  });

  if (error || !updatedProfile) {
    setGuestDistrict(district);
    return { profile, authenticated: true };
  }

  notifyLocationChanged();
  return { profile: updatedProfile, authenticated: true };
}

export function requestBrowserLocation() {
  return new Promise<Coordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Геолокация недоступна в этом браузере"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      reject,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

