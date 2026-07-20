"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { CompactSearchFilters } from "@/components/search/CompactSearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import type { Listing } from "@/utils/listings";
import { LISTINGS_EVENT, getAllListings } from "@/utils/listings";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { getActiveListings, mapListingRowToProduct } from "@/lib/data/listings";
import { createClient } from "@/utils/supabase/client";
import {
  filterListings,
  filtersFromSearchParams,
  filtersToSearchParams,
  saveSearchHistoryItem,
  type SearchFiltersState
} from "@/utils/search";
import type { Coordinates } from "@/lib/location/distance";
import {
  LOCATION_EVENT,
  getLocationForDistrict,
  loadHomeDistrict
} from "@/lib/location/currentLocation";

export function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>("ru");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [homeDistrict, setHomeDistrict] = useState("yunusabad");
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(
    getLocationForDistrict("yunusabad")
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const filters = useMemo(
    () => ({
      ...filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
      sort: "default" as const
    }),
    [searchParams]
  );
  const [draftQuery, setDraftQuery] = useState(filters.q);

  useEffect(() => {
    setDraftQuery(filters.q);
  }, [filters.q]);

  useEffect(() => {
    let mounted = true;

    async function syncUser() {
      const user = await getCurrentUser();
      if (!mounted) {
        return;
      }

      setCurrentUserId(user?.id ?? null);
    }

    void syncUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draftQuery !== filters.q) {
        updateFilters({ q: draftQuery });
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [draftQuery]);

  useEffect(() => {
    if (filters.q.trim()) {
      saveSearchHistoryItem(currentUserId, filters.q);
    }
  }, [currentUserId, filters.q]);

  useEffect(() => {
    let mounted = true;

    async function syncListings() {
      const localListings = getAllListings();

      if (!hasSupabaseBrowserEnv()) {
        if (mounted) {
          setListings(localListings);
          setIsLoadingListings(false);
        }
        return;
      }

      const supabase = createClient();
      const remoteListings = await getActiveListings(supabase);
      if (mounted) {
        setListings([
          ...remoteListings.map((listing) => ({
            ...mapListingRowToProduct(listing),
            description: listing.description
          })),
          ...localListings
        ]);
        setIsLoadingListings(false);
      }
    }

    void syncListings();
    window.addEventListener(LISTINGS_EVENT, syncListings);
    window.addEventListener("storage", syncListings);

    return () => {
      mounted = false;
      window.removeEventListener(LISTINGS_EVENT, syncListings);
      window.removeEventListener("storage", syncListings);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function syncLocation() {
      const result = await loadHomeDistrict();

      if (!mounted) {
        return;
      }

      setHomeDistrict(result.district);
      setCurrentLocation(getLocationForDistrict(result.district));
    }

    void syncLocation();
    window.addEventListener(LOCATION_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);

    return () => {
      mounted = false;
      window.removeEventListener(LOCATION_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  const results = useMemo(
    () => filterListings(listings, filters, currentLocation, homeDistrict),
    [currentLocation, filters, homeDistrict, listings]
  );

  function updateFilters(patch: Partial<SearchFiltersState>) {
    const dynamicReset: Partial<SearchFiltersState> =
      patch.category !== undefined
        ? {
            subcategory: "",
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
          }
        : {};
    const nextFilters = { ...filters, ...dynamicReset, ...patch };
    const nextParams = filtersToSearchParams(nextFilters);
    router.replace(`/search${nextParams.toString() ? `?${nextParams}` : ""}` as never, {
      scroll: false
    });
  }

  function resetFilters() {
    setDraftQuery("");
    router.replace("/search" as never, { scroll: false });
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={draftQuery}
        onQueryChange={setDraftQuery}
      />

      <section className="mx-auto max-w-[1504px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
            Поиск объявлений
          </h1>
          <p className="mt-2 text-base text-ink/62">
            Найдите товары, услуги и предложения рядом
          </p>
        </div>

        <CompactSearchFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
        />

        <SearchResults
          listings={results}
          onReset={resetFilters}
          isLoading={isLoadingListings}
        />
      </section>
    </main>
  );
}
