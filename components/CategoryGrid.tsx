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
    <section id="categories" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
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
          className={`focus-ring h-11 w-fit rounded-full px-5 text-sm font-semibold transition ${
            activeCategory === "all"
              ? "bg-ink text-white"
              : "border border-ink/10 bg-white text-ink shadow-sm hover:border-leaf/30"
          }`}
        >
          {t.allCategories}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index + 1}
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
  const description =
    language === "uz"
      ? category.descriptionUz ?? category.description
      : category.descriptionRu ?? category.description;

  return (
    <button
      onClick={onClick}
      className={`focus-ring group relative min-h-[210px] overflow-hidden rounded-[24px] border bg-white p-6 text-left shadow-[0_18px_45px_rgba(24,32,29,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(24,32,29,0.14)] ${
        active ? "border-leaf ring-2 ring-leaf/20" : "border-ink/8"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(78,125,92,0.15),transparent_32%),linear-gradient(135deg,rgba(247,245,239,0.85),rgba(255,255,255,0))]" />
      <div className="relative z-10 flex h-full min-h-[162px] flex-col justify-between">
        <div>
          <span className="text-xl font-semibold text-leaf">{index}</span>
          <h3 className="mt-3 max-w-[13rem] text-xl font-semibold leading-tight text-ink">
            {label}
          </h3>
          <p className="mt-2 max-w-[12rem] text-sm leading-5 text-ink/55">{description}</p>
        </div>
      </div>
      <CategoryIllustration id={category.id} />
    </button>
  );
}

function CategoryIllustration({ id }: { id: string }) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 h-28 w-36 transition duration-300 group-hover:scale-105">
      <div className="absolute bottom-1 right-2 h-5 w-28 rounded-full bg-ink/10 blur-md" />
      {id === "auto" && <AutoIllustration />}
      {id === "real-estate" && <RealEstateIllustration />}
      {id === "electronics" && <ElectronicsIllustration />}
      {id === "fashion" && <FashionIllustration />}
      {id === "jobs" && <JobsIllustration />}
      {id === "services" && <ServicesIllustration />}
      {id === "parts" && <PartsIllustration />}
      {id === "home" && <HomeIllustration />}
      {id === "business" && <BusinessIllustration />}
    </div>
  );
}

function AutoIllustration() {
  return (
    <>
      <div className="absolute bottom-8 right-3 h-12 w-28 rounded-[1.6rem_2rem_1rem_1rem] bg-gradient-to-br from-white to-[#dfe7e2] shadow-xl ring-1 ring-ink/10" />
      <div className="absolute bottom-16 right-24 h-7 w-14 -skew-x-12 rounded-t-2xl bg-gradient-to-br from-[#d9e8df] to-white ring-1 ring-ink/10" />
      <div className="absolute bottom-5 right-20 h-8 w-8 rounded-full bg-ink shadow-inner ring-4 ring-white" />
      <div className="absolute bottom-5 right-8 h-8 w-8 rounded-full bg-ink shadow-inner ring-4 ring-white" />
      <div className="absolute bottom-11 right-2 h-3 w-4 rounded-full bg-honey" />
    </>
  );
}

function RealEstateIllustration() {
  return (
    <>
      <div className="absolute bottom-5 right-8 h-20 w-24 rounded-xl bg-gradient-to-br from-[#f6f1df] to-white shadow-xl ring-1 ring-ink/10" />
      <div className="absolute bottom-[86px] right-3 h-14 w-28 rotate-[-4deg] rounded-t-xl bg-gradient-to-br from-leaf to-[#8fb56a] shadow-lg" />
      <div className="absolute bottom-5 right-[42px] h-12 w-9 rounded-t-full bg-[#7aa064]" />
      <div className="absolute bottom-5 right-[76px] h-16 w-11 rounded-t-lg bg-[#d7a65a]" />
      <div className="absolute bottom-12 right-[118px] h-7 w-7 rounded-full bg-[#8fb56a]" />
      <div className="absolute bottom-5 right-2 h-11 w-8 rounded-t-full bg-[#8fb56a]" />
    </>
  );
}

function ElectronicsIllustration() {
  return (
    <>
      <div className="absolute bottom-8 right-10 h-24 w-16 rotate-[-7deg] rounded-[1.2rem] bg-gradient-to-br from-[#242a35] to-[#8685b8] shadow-xl ring-4 ring-white" />
      <div className="absolute bottom-[52px] right-2 h-20 w-14 rotate-[8deg] rounded-[1rem] bg-gradient-to-br from-[#dcd9ff] to-[#7d77b8] shadow-lg ring-4 ring-white" />
      <div className="absolute bottom-9 right-[100px] h-10 w-16 rounded-2xl bg-white shadow-lg ring-1 ring-ink/10" />
      <div className="absolute bottom-14 right-[76px] h-5 w-5 rounded-full bg-ink/15" />
      <div className="absolute bottom-14 right-[112px] h-5 w-5 rounded-full bg-ink/15" />
    </>
  );
}

function FashionIllustration() {
  return (
    <>
      <div className="absolute bottom-5 right-[72px] h-[88px] w-[72px] rounded-t-[2rem] bg-gradient-to-br from-[#cfe1ee] to-[#8eb2c9] shadow-xl ring-1 ring-ink/10" />
      <div className="absolute bottom-24 right-[92px] h-3 w-8 rounded-full border-2 border-[#c59b58]" />
      <div className="absolute bottom-4 right-4 h-16 w-20 rounded-[1.5rem] bg-gradient-to-br from-[#f0d9a7] to-[#d0a363] shadow-lg ring-1 ring-ink/10" />
      <div className="absolute bottom-[100px] right-[104px] h-8 w-12 rounded-b-full border-b-4 border-[#d8b26d]" />
      <div className="absolute bottom-5 right-[112px] h-9 w-20 rounded-full bg-white shadow-md ring-1 ring-ink/10" />
    </>
  );
}

function JobsIllustration() {
  return (
    <>
      <div className="absolute bottom-5 right-8 h-24 w-[120px] rounded-2xl bg-gradient-to-br from-[#7c5730] to-[#3b2918] shadow-xl" />
      <div className="absolute bottom-[108px] right-[70px] h-9 w-[72px] rounded-t-2xl border-8 border-[#6a4826]" />
      <div className="absolute bottom-[60px] right-[84px] h-4 w-10 rounded bg-[#d1a15a]" />
      <div className="absolute bottom-5 right-8 h-8 w-[120px] rounded-b-2xl bg-black/10" />
    </>
  );
}

function ServicesIllustration() {
  return (
    <>
      <div className="absolute bottom-5 right-5 h-14 w-24 rounded-2xl bg-gradient-to-br from-[#b8d6cf] to-[#73a79b] shadow-lg" />
      <div className="absolute bottom-32 right-[76px] h-14 w-16 rotate-[-18deg] rounded-lg bg-gradient-to-br from-[#2d8f8a] to-[#1e5d61] shadow-xl" />
      <div className="absolute bottom-[116px] right-[68px] h-7 w-24 rotate-[-18deg] rounded-full bg-[#1e5d61]" />
      <div className="absolute bottom-[98px] right-10 h-8 w-8 rounded-full bg-[#26343a]" />
      <div className="absolute bottom-12 right-[52px] h-14 w-4 rounded bg-[#26343a]" />
      <div className="absolute bottom-14 right-[104px] h-20 w-4 rotate-[16deg] rounded bg-[#d0a363]" />
    </>
  );
}

function PartsIllustration() {
  return (
    <>
      <div className="absolute bottom-10 right-12 h-24 w-24 rounded-full bg-gradient-to-br from-[#2f3640] to-[#101418] shadow-xl ring-8 ring-white" />
      <div className="absolute bottom-[68px] right-[76px] h-10 w-10 rounded-full bg-[#d6dde0] ring-4 ring-[#7b8790]" />
      <div className="absolute bottom-10 right-3 h-24 w-8 rounded-full bg-gradient-to-b from-[#77a5d8] to-[#306699] shadow-lg" />
      <div className="absolute bottom-20 right-3 h-5 w-8 rounded-full bg-[#204b75]" />
      <div className="absolute bottom-[136px] right-3 h-5 w-8 rounded-full bg-[#204b75]" />
    </>
  );
}

function HomeIllustration() {
  return (
    <>
      <div className="absolute bottom-5 right-[76px] h-[72px] w-24 rounded-[1.3rem] bg-gradient-to-br from-[#9fbf92] to-[#5f8b57] shadow-xl" />
      <div className="absolute bottom-5 right-28 h-8 w-8 rounded bg-[#5f8b57]" />
      <div className="absolute bottom-24 right-2 h-[104px] w-8 rounded-full bg-gradient-to-b from-[#d8b26d] to-[#a77d3b]" />
      <div className="absolute bottom-[132px] right-[-2px] h-16 w-[72px] rounded-full bg-gradient-to-br from-[#f6e7bd] to-[#caa767] shadow-lg" />
      <div className="absolute bottom-5 right-3 h-20 w-[60px] rounded-b-2xl bg-[#8eb56e]" />
      <div className="absolute bottom-[92px] right-4 h-12 w-7 rotate-[-24deg] rounded-full bg-leaf" />
    </>
  );
}

function BusinessIllustration() {
  return (
    <>
      <div className="absolute bottom-5 right-7 h-[88px] w-28 rounded-xl bg-gradient-to-br from-[#f4efe0] to-white shadow-xl ring-1 ring-ink/10" />
      <div className="absolute bottom-[108px] right-7 h-[52px] w-28 rounded-t-xl bg-leaf" />
      <div className="absolute bottom-[126px] right-8 h-8 w-[104px] rounded-t-xl bg-[repeating-linear-gradient(90deg,#ffffff_0_14px,#6da45c_14px_28px)] shadow-md" />
      <div className="absolute bottom-5 right-[92px] h-[52px] w-[52px] rounded-t-lg bg-[#8fb56a]" />
      <div className="absolute bottom-5 right-9 h-10 w-9 rounded-t-lg bg-[#d0a363]" />
      <div className="absolute bottom-5 right-1 h-8 w-8 rounded-full bg-[#8fb56a]" />
    </>
  );
}
