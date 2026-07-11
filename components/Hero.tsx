import Image from "next/image";
import type { Language } from "./i18n";
import { translations } from "./i18n";
import { SearchBar } from "./SearchBar";

type HeroProps = {
  query: string;
  language: Language;
  onQueryChange: (query: string) => void;
};

export function Hero({ query, language, onQueryChange }: HeroProps) {
  const t = translations[language];

  return (
    <section className="mx-auto max-w-[1504px] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="relative min-h-[420px] overflow-hidden rounded-[24px] bg-[#f4ead8] shadow-[0_22px_70px_rgba(24,32,29,0.08)]">
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,rgba(19,69,48,0.28)_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -left-20 top-0 h-full w-80 opacity-[0.18] [background:repeating-radial-gradient(circle_at_center,transparent_0_12px,rgba(22,69,48,0.22)_13px_15px)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7efdf] via-[#f7efdf]/96 to-[#f7efdf]/20" />

        <div className="relative z-10 grid min-h-[420px] items-center gap-6 px-6 py-9 md:grid-cols-[0.9fr_1.1fr] md:px-12 lg:px-24">
          <div>
            <h1 className="max-w-[560px] text-5xl font-semibold leading-[1.1] tracking-normal text-ink sm:text-6xl lg:text-7xl">
              {t.heroLineOne}
              <br />
              {t.heroLineTwo}
              {t.heroBrand ? <span className="text-leaf"> {t.heroBrand}</span> : null}.
            </h1>
            <p className="mt-5 max-w-[520px] text-xl leading-8 text-ink/78">
              {t.heroSubtitle}
            </p>
            <SearchBar
              query={query}
              districtLabel={t.allDistricts}
              placeholder={t.searchPlaceholder}
              onQueryChange={onQueryChange}
            />
          </div>

          <div className="relative min-h-[260px] md:min-h-[380px]">
            <Image
              src="/images/approved-home-reference.png"
              alt="Blue and white Uzbek Choi teapot"
              fill
              priority
              className="scale-[1.95] object-cover object-[78%_32%]"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
