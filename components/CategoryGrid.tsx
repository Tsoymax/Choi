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
      className={`focus-ring group relative min-h-[142px] w-full overflow-hidden rounded-[24px] border bg-white p-5 text-left shadow-[0_12px_34px_rgba(24,32,29,0.07)] transition duration-300 hover:-translate-y-1 hover:border-leaf/25 hover:shadow-[0_18px_44px_rgba(24,32,29,0.11)] sm:min-h-[168px] sm:p-6 ${
        active ? "border-leaf ring-2 ring-leaf/18" : "border-ink/8"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_83%_58%,rgba(238,246,240,0.88)_0%,rgba(248,251,248,0.58)_38%,rgba(255,255,255,0)_68%)]" />
      <span className="pointer-events-none absolute -right-10 -bottom-12 h-48 w-48 rounded-full bg-leaf/7 blur-2xl transition duration-300 group-hover:bg-leaf/11" />
      <span className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-mist text-leaf opacity-0 transition group-hover:opacity-100">
        <ArrowUpRight size={16} />
      </span>
      <span className="relative z-10 flex min-h-[96px] max-w-[52%] items-center text-[22px] font-semibold leading-[1.16] text-ink sm:max-w-[50%] sm:text-[24px]">
        <span className="block text-balance">{label}</span>
      </span>
      <span className="pointer-events-none absolute inset-y-2 right-2 flex w-[55%] items-center justify-end overflow-hidden rounded-r-[22px] sm:inset-y-3 sm:right-3 sm:w-[54%]">
        <span className="absolute bottom-2 right-0 h-[78%] w-[88%] rounded-[30px] bg-[radial-gradient(ellipse_at_center,rgba(241,247,242,0.92)_0%,rgba(255,255,255,0.72)_46%,rgba(255,255,255,0)_74%)]" />
        <Image
          src={categoryImagePaths[index] ?? categoryImagePaths[0]}
          alt=""
          width={420}
          height={420}
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 26vw, 18vw"
          aria-hidden="true"
          className="relative z-10 h-[96%] w-full object-contain object-right-bottom mix-blend-multiply drop-shadow-[0_18px_24px_rgba(24,32,29,0.10)] contrast-[1.02] transition duration-300 group-hover:scale-[1.045]"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse at 68% 55%, #000 0%, #000 54%, rgba(0,0,0,0.86) 64%, transparent 86%)",
            maskImage:
              "radial-gradient(ellipse at 68% 55%, #000 0%, #000 54%, rgba(0,0,0,0.86) 64%, transparent 86%)"
          }}
        />
      </span>
    </button>
  );
}
