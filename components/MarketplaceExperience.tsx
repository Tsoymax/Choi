"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CategoryGrid } from "./CategoryGrid";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ProductGrid } from "./ProductGrid";
import type { Language } from "./i18n";
import type { Category, Product } from "./types";
import { LISTINGS_EVENT, getStoredListings } from "@/utils/listings";
import { hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { getActiveListings, mapListingRowToProduct } from "@/lib/data/listings";
import { createClient } from "@/utils/supabase/client";
import { sellCategories } from "@/components/sell/sellData";
import { DistrictSelector } from "@/components/location/DistrictSelector";
import { RadiusSelector } from "@/components/location/RadiusSelector";
import type { ProfileRow } from "@/lib/data/profiles";
import type { Coordinates, DistanceRadius } from "@/lib/location/distance";
import {
  getListingDistance,
  getNextRadius,
  isInsideRadius
} from "@/lib/location/distance";
import {
  LOCATION_EVENT,
  getLocationForDistrict,
  getStoredSearchRadius,
  loadHomeDistrict,
  requestBrowserLocation,
  saveHomeDistrict,
  setStoredSearchRadius
} from "@/lib/location/currentLocation";

type MarketplaceExperienceProps = {
  categories: Category[];
  products: Product[];
};

export function MarketplaceExperience({
  categories,
  products
}: MarketplaceExperienceProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Language>("ru");
  const activeCategory = "all";
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const [homeDistrict, setHomeDistrict] = useState("yunusabad");
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(
    getLocationForDistrict("yunusabad")
  );
  const [radius, setRadius] = useState<DistanceRadius>("5");
  const [currentProfile, setCurrentProfile] = useState<ProfileRow | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  useEffect(() => {
    const syncLocalProducts = () =>
      setLocalProducts(
        getStoredListings().filter((listing) => {
          const status = listing.status ?? "active";
          return status === "active" || status === "reserved";
        })
      );

    syncLocalProducts();
    window.addEventListener(LISTINGS_EVENT, syncLocalProducts);
    window.addEventListener("storage", syncLocalProducts);

    return () => {
      window.removeEventListener(LISTINGS_EVENT, syncLocalProducts);
      window.removeEventListener("storage", syncLocalProducts);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function syncRemoteProducts() {
      if (!hasSupabaseBrowserEnv()) {
        return;
      }

      const supabase = createClient();
      const listings = await getActiveListings(supabase);

      if (!mounted) {
        return;
      }

      setRemoteProducts(listings.map(mapListingRowToProduct));
    }

    void syncRemoteProducts();
    window.addEventListener(LISTINGS_EVENT, syncRemoteProducts);

    return () => {
      mounted = false;
      window.removeEventListener(LISTINGS_EVENT, syncRemoteProducts);
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
      setCurrentProfile(result.profile);
      setCurrentLocation((location) =>
        gpsActive ? location : getLocationForDistrict(result.district)
      );
      setRadius(getStoredSearchRadius());
    }

    void syncLocation();
    window.addEventListener(LOCATION_EVENT, syncLocation);
    window.addEventListener("storage", syncLocation);

    return () => {
      mounted = false;
      window.removeEventListener(LOCATION_EVENT, syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, [gpsActive]);

  const allProducts = useMemo(
    () => [...remoteProducts, ...localProducts, ...products],
    [localProducts, products, remoteProducts]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allProducts
      .filter((product) => {
        const status = product.status ?? "active";
        if (status !== "active" && status !== "reserved") {
          return false;
        }

        const matchesQuery =
          !normalizedQuery ||
          [
            product.title,
            product.titleRu,
            product.titleUz,
            product.seller,
            product.badgeRu,
            product.badgeUz
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesCategory =
          activeCategory === "all" || product.category === activeCategory;
        const distanceKm = getListingDistance(product, currentLocation);
        const matchesRadius = isInsideRadius(product, distanceKm, radius, homeDistrict);

        return matchesQuery && matchesCategory && matchesRadius;
      })
      .map((product) => ({
        ...product,
        distanceKm: getListingDistance(product, currentLocation)
      }))
      .sort((first, second) => {
        const firstDistance = first.distanceKm ?? Number.POSITIVE_INFINITY;
        const secondDistance = second.distanceKm ?? Number.POSITIVE_INFINITY;

        if (firstDistance !== secondDistance) {
          return firstDistance - secondDistance;
        }

        return (
          new Date(second.createdAt ?? 0).getTime() -
          new Date(first.createdAt ?? 0).getTime()
        );
      });
  }, [activeCategory, allProducts, currentLocation, homeDistrict, query, radius]);

  function openSearch(nextQuery = query) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }
    params.set("district", homeDistrict);
    params.set("distanceRadius", radius);

    router.push(`/search${params.toString() ? `?${params}` : ""}` as never);
  }

  function openCategorySearch(categoryId: string) {
    const params = new URLSearchParams();
    const category = sellCategories.find((item) => item.id === categoryId);
    if (category) {
      params.set("category", category.label);
    }
    params.set("district", homeDistrict);
    params.set("distanceRadius", radius);

    router.push(`/search${params.toString() ? `?${params}` : ""}` as never);
  }

  async function changeDistrict(nextDistrict: string) {
    setGpsActive(false);
    setHomeDistrict(nextDistrict);
    setCurrentLocation(getLocationForDistrict(nextDistrict));
    const result = await saveHomeDistrict(nextDistrict, currentProfile);
    setCurrentProfile(result.profile);
  }

  function changeRadius(nextRadius: DistanceRadius) {
    setRadius(nextRadius);
    setStoredSearchRadius(nextRadius);
  }

  async function useGpsLocation() {
    const gpsLocation = await requestBrowserLocation();
    setCurrentLocation(gpsLocation);
    setGpsActive(true);
  }

  function expandRadius() {
    changeRadius(getNextRadius(radius));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />

      <section className="mx-auto max-w-[1504px] px-4 pb-2 pt-5 sm:px-6 lg:px-8">
        <div className="rounded-[24px] bg-white p-4 shadow-[0_14px_44px_rgba(24,32,29,0.08)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DistrictSelector
              district={homeDistrict}
              gpsActive={gpsActive}
              onDistrictChange={changeDistrict}
              onUseGps={useGpsLocation}
            />
            <div className="w-full sm:w-[220px]">
              <RadiusSelector value={radius} onChange={changeRadius} />
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              openSearch();
            }}
            className="mt-4 flex h-14 items-center gap-3 rounded-2xl bg-mist px-4"
          >
            <Search size={22} className="text-ink/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-ink placeholder:text-ink/40 focus:outline-none"
              placeholder="Что ищете рядом?"
            />
            <button
              type="submit"
              className="focus-ring hidden h-10 rounded-full bg-leaf px-5 text-sm font-semibold text-white sm:inline-flex sm:items-center"
            >
              Найти
            </button>
          </form>
        </div>
      </section>

      <CategoryGrid
        categories={categories}
        activeCategory={activeCategory}
        language={language}
        onCategoryChange={openCategorySearch}
      />
      <section id="discover" className="mx-auto max-w-[1504px] px-4 py-5 sm:px-6 lg:px-8">
        <ProductGrid
          products={filteredProducts}
          language={language}
          onExpandRadius={radius === "all" ? undefined : expandRadius}
        />
      </section>
      <Footer language={language} />
    </main>
  );
}
