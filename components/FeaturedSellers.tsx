import { ArrowRight } from "lucide-react";
import type { Product } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";

type FeaturedSellersProps = {
  products: Product[];
  language: Language;
};

export function FeaturedSellers({ products, language }: FeaturedSellersProps) {
  const t = translations[language];

  return (
    <section id="sellers" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <div key={product.id} className="rounded-3xl border border-ink/10 bg-ink p-6 text-white shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
              {t.featuredSeller}
            </p>
            <h3 className="mt-3 text-2xl font-semibold">{product.seller}</h3>
            <p className="mt-3 text-sm leading-6 text-white/68">
              {language === "uz"
                ? "Toshkentdagi yaqin xaridorlar uchun tez javob beradigan ishonchli sotuvchi."
                : "Надежный продавец с быстрыми ответами для покупателей рядом в Ташкенте."}
            </p>
            <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white" href="#">
              {t.viewShop}
              <ArrowRight size={17} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
