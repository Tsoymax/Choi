"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { CategoryGrid } from "./CategoryGrid";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ProductGrid } from "./ProductGrid";
import type { Language } from "./i18n";
import type { Category, Product } from "./types";
import { LISTINGS_EVENT, getStoredListings } from "@/utils/listings";
import { sellCategories } from "@/components/sell/sellData";

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

  useEffect(() => {
    const syncLocalProducts = () =>
      setLocalProducts(
        getStoredListings().filter((listing) => (listing.status ?? "active") === "active")
      );

    syncLocalProducts();
    window.addEventListener(LISTINGS_EVENT, syncLocalProducts);
    window.addEventListener("storage", syncLocalProducts);

    return () => {
      window.removeEventListener(LISTINGS_EVENT, syncLocalProducts);
      window.removeEventListener("storage", syncLocalProducts);
    };
  }, []);

  const allProducts = useMemo(
    () => [...localProducts, ...products],
    [localProducts, products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allProducts
      .filter((product) => {
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
        return matchesQuery && matchesCategory;
      })
      .sort((first, second) => {
        const firstDistance = first.distanceKm ?? Number.POSITIVE_INFINITY;
        const secondDistance = second.distanceKm ?? Number.POSITIVE_INFINITY;
        return firstDistance - secondDistance;
      });
  }, [activeCategory, allProducts, query]);

  function openSearch(nextQuery = query) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }
    params.set("district", "Юнусабад");

    router.push(`/search${params.toString() ? `?${params}` : ""}` as never);
  }

  function openCategorySearch(categoryId: string) {
    const params = new URLSearchParams();
    const category = sellCategories.find((item) => item.id === categoryId);
    if (category) {
      params.set("category", category.label);
    }

    router.push(`/search${params.toString() ? `?${params}` : ""}` as never);
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
          <div className="flex items-center gap-2 text-sm font-semibold text-leaf">
            <MapPin size={18} />
            Юнусабад
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
        <ProductGrid products={filteredProducts} language={language} />
      </section>
      <Footer language={language} />
    </main>
  );
}
