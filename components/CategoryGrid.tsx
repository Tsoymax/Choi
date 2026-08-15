"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
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
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const subcategories = useMemo(
    () => getSubcategories(expandedCategory),
    [expandedCategory]
  );

  function handleCategoryClick(categoryId: string) {
    setExpandedCategory((current) => (current === categoryId ? "" : categoryId));
    setSelectedSubcategory("");
  }

  function handleAllCategoriesClick() {
    setExpandedCategory("");
    setSelectedSubcategory("");
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
            <div
              key={category.id}
              className={`min-w-0 ${desktopSpan} ${isExpanded ? "col-span-2" : ""}`}
            >
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
                  selectedSubcategory={selectedSubcategory}
                  onClose={() => {
                    setExpandedCategory("");
                    setSelectedSubcategory("");
                  }}
                  onSelect={(subcategory) => {
                    setSelectedSubcategory(subcategory);
                    onCategoryChange(category.id, subcategory);
                  }}
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
      className={`focus-ring group relative h-[196px] w-full overflow-hidden rounded-[24px] border bg-[#f4f4e8] text-left shadow-[0_12px_30px_rgba(24,32,29,0.065)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(24,32,29,0.11)] sm:h-[210px] ${
        compact ? "lg:h-[172px]" : "lg:h-[192px]"
      } ${
        active ? "border-leaf ring-2 ring-leaf/15" : "border-ink/8 hover:border-leaf/25"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_78%,rgba(255,255,255,0.88),transparent_38%),linear-gradient(118deg,#ffffff_0%,#fbfbf7_49%,#edf0e2_100%)]" />
      <span className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-leaf/[0.06] blur-3xl transition duration-300 group-hover:bg-leaf/[0.11]" />
      <span className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-leaf/0 transition-all duration-300 group-hover:bg-leaf/60" />

      <span className="absolute left-0 top-0 z-20 block max-w-[63%] min-w-0 px-4 pt-5 sm:px-5 sm:pt-6 lg:max-w-[57%] lg:px-6 lg:pt-6">
        <span
          className={`block max-w-full whitespace-normal font-semibold leading-[1.16] tracking-normal text-ink [overflow-wrap:normal] ${
            compact ? "text-[16px] sm:text-[18px] lg:text-[17px]" : "text-[17px] sm:text-[20px] lg:text-[18px]"
          }`}
        >
          {label}
        </span>
      </span>

      <span className="pointer-events-none absolute bottom-0 right-0 z-[5] h-full w-[65%] bg-[linear-gradient(90deg,rgba(247,248,242,0)_0%,rgba(247,248,242,0.18)_24%,rgba(247,248,242,0.8)_100%)]" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 z-10 h-[96%] w-[58%] bg-no-repeat transition duration-500 [mask-image:linear-gradient(90deg,transparent_0%,#000_18%,#000_100%)] [mask-repeat:no-repeat] group-hover:scale-[1.035] group-hover:brightness-[1.02]"
        style={{
          backgroundImage: "url('/images/category-sprite-v2.png')",
          backgroundPosition: spritePosition,
          backgroundSize: "300% 300%"
        }}
      />

      <span className="pointer-events-none absolute bottom-0 right-0 z-20 h-16 w-24 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.28),transparent_70%)]" />
    </button>
  );
}

type SubcategoryPanelProps = {
  title: string;
  subcategories: Array<{ id: string; label: string }>;
  selectedSubcategory: string;
  onClose: () => void;
  onSelect: (subcategory: string) => void;
};

function SubcategoryPanel({
  title,
  subcategories,
  selectedSubcategory,
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

      <div className="relative mt-4 grid max-h-[220px] grid-cols-2 gap-2 overflow-y-auto pr-1">
        {subcategories.map((subcategory) => {
          const isSelected = selectedSubcategory === subcategory.label;

          return (
            <button
              key={subcategory.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(subcategory.label)}
              className={`focus-ring min-h-11 min-w-0 rounded-2xl border px-3 py-2 text-left text-sm font-semibold leading-snug transition ${
                isSelected
                  ? "border-leaf bg-leaf text-white shadow-[0_8px_18px_rgba(75,129,94,0.24)]"
                  : "border-ink/8 bg-mist/55 text-ink shadow-[0_6px_16px_rgba(24,32,29,0.04)] hover:border-leaf/30 hover:bg-white"
              }`}
            >
              {subcategory.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
