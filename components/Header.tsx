import Image from "next/image";
import { Info, Plus } from "lucide-react";
import type { Language } from "./i18n";
import { translations } from "./i18n";

type HeaderProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function Header({ language, onLanguageChange }: HeaderProps) {
  const t = translations[language];

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <a href="#" className="flex items-center gap-3" aria-label="Choi home">
        <Image src="/logo.svg" alt="Choi" width={118} height={48} priority />
      </a>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="focus-ring hidden h-11 items-center rounded-full px-4 text-sm font-semibold text-white/90 hover:text-white sm:flex">
          {t.signIn}
        </button>
        <button className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-coral px-4 text-sm font-semibold text-white shadow-lg shadow-coral/25 sm:px-5">
          <Plus size={18} />
          {t.sell}
        </button>
        <button className="focus-ring hidden h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/90 hover:border-white/30 md:flex">
          <Info size={17} />
          {t.about}
        </button>
        <div className="flex rounded-full border border-white/15 bg-white/5 p-1">
          {(["ru", "uz"] as const).map((item) => (
            <button
              key={item}
              onClick={() => onLanguageChange(item)}
              className={`focus-ring h-9 rounded-full px-3 text-sm font-semibold uppercase ${
                language === item
                  ? "bg-white text-ink"
                  : "text-white/72 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
