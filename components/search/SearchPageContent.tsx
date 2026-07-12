"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { SearchBar } from "@/components/SearchBar";
import { MobileFilters } from "@/components/search/MobileFilters";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { SortSelect } from "@/components/search/SortSelect";
import type { Listing } from "@/utils/listings";
import { LISTINGS_EVENT, getAllListings } from "@/utils/listings";
import {
  defaultSearchFilters,
  filterListings,
  filtersFromSearchParams,
  filtersToSearchParams,
  type SearchFiltersState
} from "@/utils/search";

export function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>("ru");
  const [listings, setListings] = useState<Listing[]>([]);
  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const [draftQuery, setDraftQuery] = useState(filters.q);

  useEffect(() => {
    setDraftQuery(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const syncListings = () => setListings(getAllListings());

    syncListings();
    window.addEventListener(LISTINGS_EVENT, syncListings);
    window.addEventListener("storage", syncListings);

    return () => {
      window.removeEventListener(LISTINGS_EVENT, syncListings);
      window.removeEventListener("storage", syncListings);
    };
  }, []);

  const results = useMemo(
    () => filterListings(listings, filters),
    [filters, listings]
  );

  function updateFilters(patch: Partial<SearchFiltersState>) {
    const nextFilters = { ...filters, ...patch };
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

      <section className="mx-auto max-w-[1504px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Поиск объявлений
          </h1>
          <p className="mt-3 text-lg text-ink/62">
            Найдите товары, услуги и предложения рядом
          </p>
          <SearchBar
            query={draftQuery}
            districtLabel="Ташкент - все районы"
            placeholder="Что вы ищете?"
            onQueryChange={setDraftQuery}
            onSearch={() => updateFilters({ q: draftQuery })}
          />
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-[24px] bg-white p-4 shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
              Результаты
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              Найдено {results.length} объявлений
            </h2>
          </div>
          <div className="flex items-end gap-3">
            <MobileFilters
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
            />
            <div className="min-w-[220px]">
              <SortSelect
                value={filters.sort}
                onChange={(sort) => updateFilters({ sort })}
              />
            </div>
          </div>
        </div>

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
