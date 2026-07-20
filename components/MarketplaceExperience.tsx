"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

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
        setIsLoadingProducts(false);
        return;
      }

      const supabase = createClient();
      const listings = await getActiveListings(supabase);

      if (!mounted) {
        return;
      }

      setRemoteProducts(listings.map(mapListingRowToProduct));
      setIsLoadingProducts(false);
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
      setCurrentLocation(getLocationForDistrict(result.district));
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
  }, []);

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

  function openCategorySearch(categoryId: string) {
    const params = new URLSearchParams();
    const category = sellCategories.find((item) => item.id === categoryId);
    if (category) {
      params.set("category", category.id);
    }
    params.set("district", homeDistrict);
    params.set("distanceRadius", radius);

    router.push(`/search${params.toString() ? `?${params}` : ""}` as never);
  }

  function expandRadius() {
    const nextRadius = getNextRadius(radius);
    setRadius(nextRadius);
    setStoredSearchRadius(nextRadius);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />

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
          isLoading={isLoadingProducts}
        />
      </section>
      <Footer language={language} />
    </main>
  );
}
