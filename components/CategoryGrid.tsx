import { SlidersHorizontal } from "lucide-react";
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
    <section id="categories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
            {t.categoriesEyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">
            {t.categoriesTitle}
          </h2>
        </div>
        <button className="focus-ring inline-flex h-11 w-fit items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm">
          <SlidersHorizontal size={17} />
          {t.filters}
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        <CategoryButton
          active={activeCategory === "all"}
          label={t.allCategories}
          description={t.allCategoriesDescription}
          onClick={() => onCategoryChange("all")}
        />
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            active={activeCategory === category.id}
            label={language === "uz" ? category.labelUz ?? category.label : category.labelRu ?? category.label}
            description={language === "uz" ? category.descriptionUz ?? category.description : category.descriptionRu ?? category.description}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </section>
  );
}

type CategoryButtonProps = {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
};

function CategoryButton({ active, label, description, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring min-w-[210px] rounded-2xl border px-5 py-4 text-left transition ${
        active
          ? "border-ink bg-ink text-white"
          : "border-ink/10 bg-white text-ink hover:border-leaf/40"
      }`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="mt-1 block text-xs opacity-70">{description}</span>
    </button>
  );
}
