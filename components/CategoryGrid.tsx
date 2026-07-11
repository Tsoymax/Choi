import type { Category } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";

const spritePositions = [
  "0% 0%",
  "50% 0%",
  "100% 0%",
  "0% 50%",
  "50% 50%",
  "100% 50%",
  "0% 100%",
  "50% 100%",
  "100% 100%"
];

type CategoryGridProps = {
  categories: Category[];
  activeCategory: string;
  language: Language;
  onCategoryChange: (categoryId: string) => void;
};

export function CategoryGrid({
  categories,
  activeCategory,
  language,
  onCategoryChange
}: CategoryGridProps) {
  const t = translations[language];

  return (
    <section id="categories" className="mx-auto max-w-[1504px] px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
            {t.categoriesEyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
            {t.categoriesTitle}
          </h2>
        </div>
        <button
          onClick={() => onCategoryChange("all")}
          className={`focus-ring hidden h-11 rounded-full px-5 text-sm font-semibold transition sm:block ${
            activeCategory === "all"
              ? "bg-ink text-white"
              : "border border-ink/10 bg-white text-ink shadow-sm hover:border-leaf/30"
          }`}
        >
          {t.allCategories}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-[repeat(20,minmax(0,1fr))]">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            active={activeCategory === category.id}
            language={language}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </section>
  );
}

type CategoryCardProps = {
  category: Category;
  index: number;
  active: boolean;
  language: Language;
  onClick: () => void;
};

function CategoryCard({
  category,
  index,
  active,
  language,
  onClick
}: CategoryCardProps) {
  const label =
    language === "uz" ? category.labelUz ?? category.label : category.labelRu ?? category.label;
  const spanClass = index < 4 ? "lg:col-span-5" : "lg:col-span-4";

  return (
    <button
      onClick={onClick}
      className={`focus-ring group relative min-h-[214px] overflow-hidden rounded-[24px] border bg-white p-6 text-left shadow-[0_16px_44px_rgba(24,32,29,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_68px_rgba(24,32,29,0.13)] sm:min-h-[232px] lg:min-h-[220px] ${spanClass} ${
        active ? "border-leaf ring-2 ring-leaf/20" : "border-ink/8"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f7f5ef]" />
      <h3 className="relative z-20 max-w-[13rem] pr-2 text-lg font-semibold leading-tight text-ink sm:text-xl">
        {label}
      </h3>
      <div
        className="absolute bottom-1 right-1 z-10 h-[68%] w-[72%] bg-[url('/images/category-sprite.png')] bg-[length:300%_300%] bg-no-repeat transition duration-300 group-hover:scale-105 sm:h-[72%] sm:w-[74%]"
        style={{ backgroundPosition: spritePositions[index] }}
        aria-hidden="true"
      />
    </button>
  );
}
