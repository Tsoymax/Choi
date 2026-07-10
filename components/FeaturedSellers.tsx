import { ArrowRight } from "lucide-react";
import type { Product } from "./types";

type FeaturedSellersProps = {
  products: Product[];
};

export function FeaturedSellers({ products }: FeaturedSellersProps) {
  return (
    <section id="sellers" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <div key={product.id} className="rounded-3xl border border-ink/10 bg-ink p-6 text-white shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
              Featured seller
            </p>
            <h3 className="mt-3 text-2xl font-semibold">{product.seller}</h3>
            <p className="mt-3 text-sm leading-6 text-white/68">
              Known for {product.title.toLowerCase()} and consistently fast
              neighborhood fulfillment.
            </p>
            <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white" href="#">
              View shop
              <ArrowRight size={17} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
