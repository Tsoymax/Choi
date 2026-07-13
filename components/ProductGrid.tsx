import type { Product } from "./types";
import { ListingCard } from "./ListingCard";
import type { Language } from "./i18n";

type ProductGridProps = {
  products: Product[];
  language: Language;
};

export function ProductGrid({ products, language }: ProductGridProps) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-ink sm:text-3xl">
            Рядом с вами
          </h2>
          <p className="mt-1 text-sm text-ink/58">
            {products.length} объявлений поблизости
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ListingCard key={product.id} product={product} language={language} />
        ))}
      </div>
    </div>
  );
}
