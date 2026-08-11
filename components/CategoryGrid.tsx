"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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

const categoryCopy: Record<string, { ru: string; uz: string; descriptionRu: string; descriptionUz: string }> = {
  auto: {
    ru: "Транспорт",
    uz: "Transport",
    descriptionRu: "Машины рядом",
    descriptionUz: "Yaqindagi mashinalar"
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
    descriptionRu: "Для авто и ремонта",
    descriptionUz: "Avto qismlari"
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

const categoryImagePaths = [
  "/images/categories/transport.png",
  "/images/categories/real-estate.png",
  "/images/categories/electronics.png",
  "/images/categories/fashion.png",
  "/images/categories/jobs.png",
  "/images/categories/services.png",
  "/images/categories/parts.png",
  "/images/categories/home.png",
  "/images/categories/business.png"
];

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
    <section id="categories" className="mx-auto max-w-[1504px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-ink">Категории</h2>
          <p className="mt-1 hidden text-sm text-ink/52 sm:block">
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
          const categoryLabel = getCategoryDisplay(category, language).label;

          return (
            <div key={category.id} className={`min-w-0 ${desktopSpan}`}>
              <CategoryCard
                category={category}
                index={index}
                active={activeCategory === category.id || isExpanded}
                language={language}
                onClick={() => handleCategoryClick(category.id)}
              />

              {isExpanded && subcategories.length > 0 ? (
                <div className="relative mt-3 overflow-hidden rounded-[24px] border border-leaf/16 bg-gradient-to-br from-white via-white to-mist/70 p-3.5 shadow-[0_14px_34px_rgba(24,32,29,0.09)] animate-in fade-in slide-in-from-top-1 duration-200 sm:p-4">
                  <span className="absolute left-8 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-leaf/16 bg-white" />
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-leaf/8" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-leaf/85">
                        Выберите подкатегорию
                      </p>
                      <h3 className="mt-1 line-clamp-1 text-base font-semibold text-ink">
                        {categoryLabel}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedCategory("")}
                      className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-sm font-semibold text-leaf transition hover:bg-leaf hover:text-white"
                      aria-label="Закрыть подкатегории"
                    >
                      ×
                    </button>
                  </div>

                  <div className="relative mt-3 flex max-h-[188px] flex-wrap gap-2 overflow-y-auto pr-1">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        type="button"
                        onClick={() => onCategoryChange(expandedCategory, subcategory.label)}
                        className="focus-ring rounded-full border border-ink/8 bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-[0_6px_16px_rgba(24,32,29,0.05)] transition hover:-translate-y-0.5 hover:border-leaf/25 hover:bg-leaf hover:text-white"
                      >
                        {subcategory.label}
                      </button>
                    ))}
                  </div>
                </div>
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
  const { label } = getCategoryDisplay(category, language);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring group relative grid min-h-[148px] w-full grid-cols-[minmax(0,0.9fr)_minmax(116px,1fr)] items-center gap-2 overflow-hidden rounded-[24px] border bg-white px-5 py-4 text-left shadow-[0_12px_34px_rgba(24,32,29,0.07)] transition duration-300 hover:-translate-y-1 hover:border-leaf/25 hover:shadow-[0_18px_44px_rgba(24,32,29,0.11)] sm:min-h-[172px] sm:grid-cols-[minmax(0,1fr)_minmax(140px,1fr)] sm:px-6 ${
        active ? "border-leaf ring-2 ring-leaf/18" : "border-ink/8"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.98)_40%,rgba(238,246,240,0.62)_100%)]" />
      <span className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-leaf/10 blur-2xl transition duration-300 group-hover:bg-leaf/14" />
      <span className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-leaf opacity-0 shadow-sm transition group-hover:opacity-100">
        <ArrowUpRight size={16} />
      </span>

      <span className="relative z-10 flex min-w-0 items-center">
        <span className="block max-w-[12rem] text-balance break-words text-[21px] font-semibold leading-[1.12] tracking-normal text-ink sm:text-[23px]">
          {label}
        </span>
      </span>

      <span className="relative z-10 flex h-[118px] min-w-0 items-center justify-end sm:h-[138px]">
        <span className="absolute bottom-1 right-0 h-[72%] w-[88%] rounded-full bg-mist/80 blur-xl transition duration-300 group-hover:bg-mist" />
        <Image
          src={categoryImagePaths[index] ?? categoryImagePaths[0]}
          alt=""
          width={720}
          height={560}
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 16vw"
          aria-hidden="true"
          className="relative z-10 h-full w-full object-contain object-right-center drop-shadow-[0_18px_24px_rgba(24,32,29,0.13)] transition duration-300 group-hover:scale-[1.04]"
        />
      </span>
    </button>
  );
}
