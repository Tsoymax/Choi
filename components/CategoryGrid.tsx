"use client";

import { useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { Category } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";
import { getSubcategories } from "@/components/sell/sellData";

type CategoryGridProps = {
  categories: Category[];
  activeCategory: string;
  language: Language;
  onCategoryChange: (categoryId: string, subcategory?: string) => void;
};

const categoryCopy: Record<
  string,
  { ru: string; uz: string; descriptionRu: string; descriptionUz: string }
> = {
  auto: {
    ru: "Транспорт",
    uz: "Transport",
    descriptionRu: "Авто рядом",
    descriptionUz: "Yaqindagi transport"
  },
  "real-estate": {
    ru: "Недвижимость",
    uz: "Ko'chmas mulk",
    descriptionRu: "Квартиры и дома",
    descriptionUz: "Uy va kvartiralar"
  },
  electronics: {
    ru: "Электроника",
    uz: "Elektronika",
    descriptionRu: "Телефоны и техника",
    descriptionUz: "Telefon va texnika"
  },
  fashion: {
    ru: "Одежда, обувь и аксессуары",
    uz: "Kiyim, poyabzal va aksessuarlar",
    descriptionRu: "Одежда, обувь, сумки",
    descriptionUz: "Kiyim, poyabzal, sumkalar"
  },
  jobs: {
    ru: "Работа и подработка",
    uz: "Ish va qo'shimcha ish",
    descriptionRu: "Вакансии рядом",
    descriptionUz: "Yaqindagi ishlar"
  },
  services: {
    ru: "Услуги",
    uz: "Xizmatlar",
    descriptionRu: "Мастера и помощь",
    descriptionUz: "Ustalar va yordam"
  },
  parts: {
    ru: "Все для авто",
    uz: "Avto uchun hammasi",
    descriptionRu: "Запчасти и аксессуары",
    descriptionUz: "Avto ehtiyot qismlari"
  },
  home: {
    ru: "Для дома",
    uz: "Uy uchun",
    descriptionRu: "Мебель и уют",
    descriptionUz: "Mebel va uy buyumlari"
  },
  business: {
    ru: "Для бизнеса",
    uz: "Biznes uchun",
    descriptionRu: "Оборудование и точки",
    descriptionUz: "Jihozlar va joylar"
  }
};

export function CategoryGrid({
  categories,
  activeCategory,
  language,
  onCategoryChange
}: CategoryGridProps) {
  const t = translations[language];
  const [expandedCategory, setExpandedCategory] = useState("");
  const subcategories = useMemo(
    () => getSubcategories(expandedCategory),
    [expandedCategory]
  );

  function handleCategoryClick(categoryId: string) {
    setExpandedCategory((current) => (current === categoryId ? "" : categoryId));
  }

  function handleAllCategoriesClick() {
    setExpandedCategory("");
    onCategoryChange("all");
  }

  return (
    <section id="categories" className="mx-auto max-w-[1504px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-ink">Категории</h2>
          <p className="mt-1 hidden text-sm text-ink/55 sm:block">
            Выберите раздел и смотрите объявления рядом
          </p>
        </div>
        <button
          type="button"
          onClick={handleAllCategoriesClick}
          className={`focus-ring h-11 shrink-0 rounded-full px-5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${
            activeCategory === "all" && !expandedCategory
              ? "bg-leaf text-white"
              : "border border-ink/10 bg-white text-ink hover:border-leaf/30"
          }`}
        >
          {t.allCategories}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(20,minmax(0,1fr))]">
        {categories.map((category, index) => {
          const isExpanded = expandedCategory === category.id;
          const desktopSpan = index < 4 ? "lg:col-span-5" : "lg:col-span-4";
          const categoryDisplay = getCategoryDisplay(category, language);

          return (
            <div key={category.id} className={`min-w-0 ${desktopSpan}`}>
              <CategoryTile
                label={categoryDisplay.label}
                imageIndex={index}
                active={activeCategory === category.id || isExpanded}
                compact={index >= 4}
                onClick={() => handleCategoryClick(category.id)}
              />

              {isExpanded && subcategories.length > 0 ? (
                <SubcategoryPanel
                  title={categoryDisplay.label}
                  subcategories={subcategories}
                  onClose={() => setExpandedCategory("")}
                  onSelect={(subcategory) => onCategoryChange(category.id, subcategory)}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getCategoryDisplay(category: Category, language: Language) {
  const copy = categoryCopy[category.id];
  const label =
    language === "uz"
      ? copy?.uz ?? category.labelUz ?? category.label
      : copy?.ru ?? category.labelRu ?? category.label;
  const description =
    language === "uz"
      ? copy?.descriptionUz ?? category.descriptionUz ?? category.description
      : copy?.descriptionRu ?? category.descriptionRu ?? category.description;

  return { label, description };
}

type CategoryTileProps = {
  label: string;
  imageIndex: number;
  active: boolean;
  compact: boolean;
  onClick: () => void;
};

function CategoryTile({
  label,
  imageIndex,
  active,
  compact,
  onClick
}: CategoryTileProps) {
  const spriteColumn = imageIndex % 3;
  const spriteRow = Math.floor(imageIndex / 3);
  const spritePosition = `${spriteColumn * 50}% ${spriteRow * 50}%`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring group relative h-[210px] w-full overflow-hidden rounded-[24px] border bg-[#f7f7f2] text-left shadow-[0_12px_30px_rgba(24,32,29,0.065)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(24,32,29,0.11)] sm:h-[220px] ${
        compact ? "lg:h-[170px]" : "lg:h-[190px]"
      } ${
        active ? "border-leaf ring-2 ring-leaf/15" : "border-ink/8 hover:border-leaf/25"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.96)_45%,rgba(240,245,238,0.72)_100%)]" />
      <span className="pointer-events-none absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-leaf/10 blur-3xl transition duration-300 group-hover:bg-leaf/15" />
      <span className="pointer-events-none absolute left-0 top-0 h-1 w-0 bg-leaf transition-all duration-300 group-hover:w-full" />

      <span className="absolute left-0 top-0 z-20 block w-full min-w-0 px-4 pt-4 sm:px-5 sm:pt-5 lg:top-1/2 lg:max-w-[52%] lg:-translate-y-1/2 lg:py-5">
        <span
          className={`block max-w-full text-balance font-semibold leading-[1.18] tracking-normal text-ink [overflow-wrap:normal] ${
            compact ? "text-[16px] sm:text-[17px] lg:text-[16px]" : "text-[17px] sm:text-[19px] lg:text-[17px]"
          }`}
        >
          {label}
        </span>
      </span>

      <span className="pointer-events-none absolute inset-x-3 bottom-2 z-[5] h-[116px] rounded-[20px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.92)_0%,rgba(241,245,239,0.55)_58%,transparent_78%)] sm:h-[126px] lg:bottom-0 lg:left-auto lg:right-0 lg:h-full lg:w-[48%] lg:rounded-none" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-[124px] w-[160px] -translate-x-1/2 bg-no-repeat transition duration-500 [mask-image:radial-gradient(ellipse_at_center,#000_62%,transparent_98%)] [mask-repeat:no-repeat] group-hover:scale-[1.045] sm:h-[136px] sm:w-[176px] lg:bottom-0 lg:left-auto lg:right-0 lg:h-full lg:w-[48%] lg:translate-x-0"
        style={{
          backgroundImage: "url('/images/category-sprite-v2.png')",
          backgroundPosition: spritePosition,
          backgroundSize: "300% 300%"
        }}
      />

      <span className="pointer-events-none absolute bottom-3 left-4 z-20 hidden items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-leaf opacity-0 shadow-sm backdrop-blur-sm transition duration-300 group-hover:opacity-100 lg:flex">
        <span>Открыть</span>
        <ChevronDown size={14} />
      </span>
    </button>
  );
}

type SubcategoryPanelProps = {
  title: string;
  subcategories: Array<{ id: string; label: string }>;
  onClose: () => void;
  onSelect: (subcategory: string) => void;
};

function SubcategoryPanel({
  title,
  subcategories,
  onClose,
  onSelect
}: SubcategoryPanelProps) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-[26px] border border-leaf/15 bg-white p-4 shadow-[0_16px_38px_rgba(24,32,29,0.09)]">
      <span className="absolute left-8 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-leaf/15 bg-white" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-mist blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-leaf/80">
            Подкатегории
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-ink">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-leaf transition hover:bg-leaf hover:text-white"
          aria-label="Закрыть подкатегории"
        >
          <X size={16} />
        </button>
      </div>

      <div className="relative mt-3 flex max-h-[190px] flex-wrap gap-2 overflow-y-auto pr-1">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            type="button"
            onClick={() => onSelect(subcategory.label)}
            className="focus-ring rounded-full border border-ink/8 bg-mist/55 px-3.5 py-2 text-sm font-semibold text-ink shadow-[0_6px_16px_rgba(24,32,29,0.04)] transition hover:-translate-y-0.5 hover:border-leaf/30 hover:bg-leaf hover:text-white"
          >
            {subcategory.label}
          </button>
        ))}
      </div>
    </div>
  );
}
