import { Sparkles } from "lucide-react";
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
    <section className="border-b border-white/10 bg-[#050607] pb-20 pt-12 text-white sm:pb-24 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
          {t.heroTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-white/82 sm:text-2xl">
          {t.heroSubtitle}
        </p>
        <SearchBar
          query={query}
          districtLabel={t.allDistricts}
          placeholder={t.searchPlaceholder}
          onQueryChange={onQueryChange}
        />
        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-base font-semibold text-white/82">
          <span className="inline-flex items-center gap-1">
            <Sparkles size={18} />
            {t.suggested}
          </span>
          {t.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onQueryChange(suggestion)}
              className="focus-ring rounded-full text-white/82 hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
