"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[repeat(20,minmax(0,1fr))]">
        {categories.map((category, index) => {
          const isExpanded = expandedCategory === category.id;
          const desktopSpan = index < 4 ? "lg:col-span-5" : "lg:col-span-4";
          const categoryDisplay = getCategoryDisplay(category, language);

          return (
            <div key={category.id} className={`min-w-0 ${desktopSpan}`}>
              <CategoryTile
                label={categoryDisplay.label}
                imageSrc={categoryImagePaths[index] ?? categoryImagePaths[0]}
                active={activeCategory === category.id || isExpanded}
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
  imageSrc: string;
  active: boolean;
  onClick: () => void;
};

function CategoryTile({ label, imageSrc, active, onClick }: CategoryTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring group relative grid min-h-[156px] w-full grid-cols-[minmax(0,1fr)_132px] items-center overflow-hidden rounded-[28px] border bg-white text-left shadow-[0_14px_38px_rgba(24,32,29,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(24,32,29,0.11)] sm:min-h-[176px] sm:grid-cols-[minmax(0,1fr)_154px] ${
        active ? "border-leaf ring-2 ring-leaf/15" : "border-ink/8 hover:border-leaf/25"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_58%,rgba(238,246,240,0.95)_0%,rgba(255,255,255,0.88)_45%,rgba(255,255,255,1)_78%)]" />
      <span className="pointer-events-none absolute right-7 top-1/2 h-[122px] w-[122px] -translate-y-1/2 rounded-full bg-mist/80 blur-xl transition duration-300 group-hover:scale-110 group-hover:bg-leaf/12 sm:h-[144px] sm:w-[144px]" />

      <span className="relative z-10 min-w-0 px-6 py-5 sm:px-7">
        <span className="block max-w-[13rem] text-balance break-words text-[22px] font-semibold leading-[1.12] tracking-normal text-ink sm:text-[25px]">
          {label}
        </span>
      </span>

      <span className="relative z-10 flex h-[136px] min-w-0 items-center justify-center pr-3 sm:h-[154px] sm:pr-4">
        <Image
          src={imageSrc}
          alt=""
          width={720}
          height={560}
          sizes="(max-width: 640px) 34vw, (max-width: 1024px) 22vw, 15vw"
          aria-hidden="true"
          className="h-full w-full object-contain drop-shadow-[0_18px_26px_rgba(24,32,29,0.14)] transition duration-300 group-hover:scale-[1.055]"
        />
      </span>

      <span className="pointer-events-none absolute bottom-4 left-6 flex items-center gap-1.5 text-xs font-semibold text-leaf/0 transition group-hover:text-leaf/80 sm:left-7">
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
