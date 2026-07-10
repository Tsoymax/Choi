import { BadgeCheck, Heart, Star } from "lucide-react";
import type { Product } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const paletteMap: Record<string, string> = {
  sage: "from-[#dfeadf] via-[#f7f1df] to-[#c9dacd]",
  coral: "from-[#ffe0d6] via-[#fff5ea] to-[#e66e57]",
  ink: "from-[#dde3df] via-[#f8f8f5] to-[#18201d]",
  honey: "from-[#ffe9bd] via-[#fff8e8] to-[#d69a3a]",
  sky: "from-[#d9edf1] via-[#f6fbfb] to-[#77a8b5]",
  plum: "from-[#eadfec] via-[#fbf7fb] to-[#8d688f]"
};

type ProductCardProps = {
  product: Product;
  language: Language;
};

export function ProductCard({ product, language }: ProductCardProps) {
  const t = translations[language];
  const title =
    language === "uz" ? product.titleUz ?? product.title : product.titleRu ?? product.title;

  return (
    <article className="group overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${paletteMap[product.palette]}`}>
        <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-ink shadow-sm">
          {product.badge}
        </div>
        <button className="focus-ring absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/88 text-ink shadow-sm">
          <Heart size={18} />
        </button>
        <div className="absolute inset-x-8 bottom-7 top-16 rounded-[2rem] bg-white/42 shadow-inner backdrop-blur-sm" />
        <div className="absolute bottom-8 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-white/72 shadow-soft ring-1 ring-white/60 transition group-hover:scale-105" />
        <div className="absolute bottom-12 left-1/2 h-16 w-36 -translate-x-1/2 rounded-full bg-ink/10 blur-xl" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-ink/58">{product.seller}</p>
          </div>
          <strong className="text-lg font-semibold text-ink">
            {formatter.format(product.price)}
          </strong>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-ink/62">
          <span className="inline-flex items-center gap-1">
            <Star size={16} className="fill-honey text-honey" />
            {product.rating} ({product.reviews})
          </span>
          <span className="inline-flex items-center gap-1">
            <BadgeCheck size={16} className="text-leaf" />
            {t.verified}
          </span>
        </div>
      </div>
    </article>
  );
}
