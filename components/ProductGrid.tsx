import Image from "next/image";
import { ChoiTeaLoader } from "./ChoiTeaLoader";
import type { Product } from "./types";
import { ListingCard } from "./ListingCard";
import type { Language } from "./i18n";

type ProductGridProps = {
  products: Product[];
  language: Language;
  onExpandRadius?: () => void;
  isLoading?: boolean;
};

export function ProductGrid({
  products,
  language,
  onExpandRadius,
  isLoading = false
}: ProductGridProps) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-ink sm:text-3xl">
            Рядом с вами
          </h2>
          <p className="mt-1 text-sm text-ink/58">
            Объявления поблизости
          </p>
        </div>
      </div>

      {isLoading ? (
        <ChoiTeaLoader label="Загружаем объявления рядом" />
      ) : products.length === 0 ? (
        <section className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
          <Image
            src="/images/choi-teapot.png"
            alt="Choi"
            width={92}
            height={92}
            className="mx-auto mb-5"
          />
          <h3 className="text-3xl font-semibold text-ink">Пока рядом тихо</h3>
          <p className="mx-auto mt-3 max-w-md text-base text-ink/62">
            Попробуйте увеличить расстояние поиска
          </p>
          {onExpandRadius ? (
            <button
              type="button"
              onClick={onExpandRadius}
              className="focus-ring mt-7 h-12 rounded-full bg-leaf px-6 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
            >
              Искать дальше
            </button>
          ) : null}
        </section>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ListingCard key={product.id} product={product} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}
