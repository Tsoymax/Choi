import type { Category } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";

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
    <section id="categories" className="mx-auto max-w-[1504px] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-normal text-ink">
          Категории
        </h2>
        <button
          onClick={() => onCategoryChange("all")}
          className={`focus-ring hidden h-10 rounded-full px-4 text-sm font-semibold transition sm:block ${
            activeCategory === "all"
              ? "bg-leaf text-white"
              : "border border-ink/10 bg-white text-ink shadow-sm hover:border-leaf/30"
          }`}
        >
          {t.allCategories}
        </button>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
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

  return (
    <button
      onClick={onClick}
      className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-leaf/30 ${
        active ? "border-leaf ring-2 ring-leaf/20" : "border-ink/8"
      } ${active ? "bg-leaf text-white" : "bg-white text-ink"}`}
    >
      {label}
    </button>
  );
}
