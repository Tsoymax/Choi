"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { MobileFilters } from "@/components/search/MobileFilters";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { SortSelect } from "@/components/search/SortSelect";
import type { Listing } from "@/utils/listings";
import { LISTINGS_EVENT, getAllListings } from "@/utils/listings";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { getActiveListings, mapListingRowToProduct } from "@/lib/data/listings";
import { createClient } from "@/utils/supabase/client";
import {
  defaultSearchFilters,
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
  const [homeDistrict, setHomeDistrict] = useState("yunusabad");
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(
    getLocationForDistrict("yunusabad")
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
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
    async function syncListings() {
      const localListings = getAllListings();

      if (!hasSupabaseBrowserEnv()) {
        setListings(localListings);
        return;
      }

      const supabase = createClient();
      const remoteListings = await getActiveListings(supabase);
      setListings([
        ...remoteListings.map((listing) => ({
          ...mapListingRowToProduct(listing),
          description: listing.description
        })),
        ...localListings
      ]);
    }

    void syncListings();
    window.addEventListener(LISTINGS_EVENT, syncListings);
    window.addEventListener("storage", syncListings);

    return () => {
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

  function removeFilter(key: keyof SearchFiltersState) {
    updateFilters({ [key]: defaultSearchFilters[key] } as Partial<SearchFiltersState>);
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

      <section className="mx-auto max-w-[1504px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Поиск объявлений
          </h1>
          <p className="mt-3 text-lg text-ink/62">
            Найдите товары, услуги и предложения рядом
          </p>
        </div>

        <div className="mb-6 flex items-end justify-between gap-3">
          <MobileFilters
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
          />
          <div className="ml-auto w-full max-w-[240px]">
            <SortSelect
              value={filters.sort}
              onChange={(sort) => updateFilters({ sort })}
            />
          </div>
        </div>

        <ActiveFilters
          filters={filters}
          onRemove={removeFilter}
          onReset={resetFilters}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
          <SearchFilters
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
          />
          <SearchResults listings={results} onReset={resetFilters} />
        </div>
      </section>
    </main>
  );
}
