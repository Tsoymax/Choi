import type { Product } from "./types";
import { ListingCard } from "./ListingCard";
import type { Language } from "./i18n";
import { translations } from "./i18n";

type ProductGridProps = {
  products: Product[];
  language: Language;
};

export function ProductGrid({ products, language }: ProductGridProps) {
  const t = translations[language];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal text-ink">
            {t.productTitle}
          </h2>
          <p className="mt-1 text-sm text-ink/58">
            {products.length} {t.productCount}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ListingCard key={product.id} product={product} language={language} />
        ))}
      </div>
    </div>
  );
}
