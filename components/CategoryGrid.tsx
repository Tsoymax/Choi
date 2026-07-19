import { ArrowUpRight } from "lucide-react";
import type { Category } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";

type CategoryGridProps = {
  categories: Category[];
  activeCategory: string;
  language: Language;
  onCategoryChange: (categoryId: string) => void;
};

const categoryCopy: Record<string, { ru: string; uz: string; descriptionRu: string; descriptionUz: string }> = {
  auto: {
    ru: "Авто",
    uz: "Avto",
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
    ru: "Одежда и аксессуары",
    uz: "Kiyim va aksessuarlar",
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
    ru: "Запчасти",
    uz: "Ehtiyot qismlar",
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

export function CategoryGrid({
  categories,
  activeCategory,
  language,
  onCategoryChange
}: CategoryGridProps) {
  const t = translations[language];

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
          onClick={() => onCategoryChange("all")}
          className={`focus-ring h-11 shrink-0 rounded-full px-5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${
            activeCategory === "all"
              ? "bg-leaf text-white"
              : "border border-ink/10 bg-white text-ink hover:border-leaf/30"
          }`}
        >
          {t.allCategories}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(20,minmax(0,1fr))]">
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
  const copy = categoryCopy[category.id];
  const label =
    language === "uz"
      ? copy?.uz ?? category.labelUz ?? category.label
      : copy?.ru ?? category.labelRu ?? category.label;
  const description =
    language === "uz"
      ? copy?.descriptionUz ?? category.descriptionUz ?? category.description
      : copy?.descriptionRu ?? category.descriptionRu ?? category.description;
  const desktopSpan = index < 4 ? "lg:col-span-5" : "lg:col-span-4";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring group relative min-h-[138px] overflow-hidden rounded-[24px] border bg-white p-4 text-left shadow-[0_12px_34px_rgba(24,32,29,0.07)] transition duration-300 hover:-translate-y-1 hover:border-leaf/25 hover:shadow-[0_18px_44px_rgba(24,32,29,0.11)] sm:min-h-[164px] sm:p-5 ${desktopSpan} ${
        active ? "border-leaf ring-2 ring-leaf/18" : "border-ink/8"
      }`}
    >
      <span className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-mist text-leaf opacity-0 transition group-hover:opacity-100">
        <ArrowUpRight size={16} />
      </span>
      <span className="relative z-10 block max-w-[72%] text-base font-semibold leading-tight text-ink sm:text-lg">
        {label}
      </span>
      <span className="relative z-10 mt-2 block max-w-[68%] text-xs font-medium leading-5 text-ink/54 sm:text-sm">
        {description}
      </span>
      <span className="absolute -bottom-4 -right-5 h-[112px] w-[132px] transition duration-300 group-hover:scale-105 sm:-bottom-5 sm:-right-4 sm:h-[138px] sm:w-[160px]">
        <span
          className="block h-full w-full bg-[url('/images/category-sprite.png')] bg-[length:300%_300%] bg-no-repeat drop-shadow-[0_14px_22px_rgba(24,32,29,0.12)]"
          style={{ backgroundPosition: spritePositions[index] ?? "50% 50%" }}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
