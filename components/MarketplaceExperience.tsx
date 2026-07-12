"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryGrid } from "./CategoryGrid";
import { DistrictFilter } from "./DistrictFilter";
import { FeaturedSellers } from "./FeaturedSellers";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { ProductGrid } from "./ProductGrid";
import type { Language } from "./i18n";
import type { Category, District, Product } from "./types";
import { LISTINGS_EVENT, getStoredListings } from "@/utils/listings";

type MarketplaceExperienceProps = {
  categories: Category[];
  districts: District[];
  products: Product[];
};

export function MarketplaceExperience({
  categories,
  districts,
  products
}: MarketplaceExperienceProps) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Language>("ru");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDistrict, setActiveDistrict] = useState("all");
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

    return allProducts.filter((product) => {
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
      const matchesDistrict =
        activeDistrict === "all" || product.district === activeDistrict;

      return matchesQuery && matchesCategory && matchesDistrict;
    });
  }, [activeCategory, activeDistrict, allProducts, query]);

  return (
    <main className="min-h-screen overflow-hidden">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />
      <Hero query={query} language={language} onQueryChange={setQuery} />
      <CategoryGrid
        categories={categories}
        activeCategory={activeCategory}
        language={language}
        onCategoryChange={setActiveCategory}
      />
      <section id="discover" className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <DistrictFilter
          districts={districts}
          activeDistrict={activeDistrict}
          language={language}
          onDistrictChange={setActiveDistrict}
        />
        <ProductGrid products={filteredProducts} language={language} />
      </section>
      <FeaturedSellers products={allProducts} language={language} />
      <Footer language={language} />
    </main>
  );
}
