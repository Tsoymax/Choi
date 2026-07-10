import type { Product } from "./types";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal text-ink">
            Today's finds
          </h2>
          <p className="mt-1 text-sm text-ink/58">
            {products.length} curated items available now
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
